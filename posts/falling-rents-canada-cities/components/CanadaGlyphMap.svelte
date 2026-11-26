<script>
    import { geoIdentity, geoPath } from 'd3';
    import MapTooltip from './MapTooltip.svelte';
    import RentTooltipBody from './RentTooltipBody.svelte';
    import { FALLING_RENT_CLASS_COLORS, FALLING_RENT_DECLINE_COLOR } from './colors.js';

    let {
        frames,              // [{ id: 'main', ... }, { id: 'bc' | 'on' | 'qc', fit, extent, region, rotation, order, row, ... }] — see the plotting-data notebook
        cities = [],         // [{ city, pct_change, base_rent, latest_rent }]; frame points index into this
        tiltDeg = 15,        // arrow lean from vertical, clockwise (chosen in the notebook by minimising arrow overlaps)
        keyTitle = ['Net change in asking rent, %'],   // legend caption, one string per line
        measure = 'nominal', // 'nominal' | 'real' — which net change the arrows show (real = after inflation)
        classBreaksNominal = [25, 50, 75],   // % change thresholds between the 4 size classes, nominal view
        classBreaksReal = [10, 25, 40],      // … and for the after-inflation view
        ariaLabel = 'Map of net change in asking rents by city',
        baseQuarter = '',    // pop-up: "Q1 2019"
        latestQuarter = '',  // pop-up: "Q1 2026"
        realYear = 2026,     // pop-up: the dollars after-inflation rents are expressed in
        scaleUp = null,      // pop-up: $ that fills the dollar bar to the right of its line (shared across the page's pop-ups)
        scaleDown = null,    // pop-up: $ that fills it to the left
    } = $props();

    // Four size classes: arrows get longer, thicker and darker with the class, stepping along an orange-to-plum spectrum (see constants.js).
    const CLASS_COLORS      = FALLING_RENT_CLASS_COLORS;
    const CLASS_LEN_FRAC    = [0.36, 0.58, 0.80, 1];    // share of the longest arrow length
    const CLASS_STROKE      = [1.5, 2.1, 2.7, 3.3];     // px
    const DECLINE_COLOR     = FALLING_RENT_DECLINE_COLOR;                // a value below zero (only possible after inflation) is drawn as a blue arrow pointing down
    const FALLBACK_WIDTH    = 700;  // px — used before the container is first measured
    const PAD_X             = 12;   // px — left/right gutter around the national map
    const TIP_GAP           = 6;    // px — gap between the tallest glyph tip and the top edge of its frame
    const MIN_HIT_HALF      = 8;    // px — minimum touch-target half-width
    const MIN_HIT_HEIGHT    = 16;   // px — minimum touch-target height
    const FADE_FRACTION     = 0.14; // share of the national map's height over which the northern crop fades out
    const OVERLAY_MIN_WIDTH = 600;  // px — narrower than this, insets form two rows and the key moves above the map
    const BC_WIDTH_FRAC     = 0.22; // desktop: Southern BC box width as a share of the map width
    const BC_MIN_WIDTH      = 150;  // px — floor, so Vancouver and Victoria keep room for their labels as the chart narrows
    const ROW_WIDTH_FRAC    = 0.88; // desktop: share of the map width the Ontario + Quebec boxes together span
    const BC_GAP            = 30;   // px — gap between the national map's southern border and the BC box
    const LEADER_SPREAD     = 8;    // px — how far apart a region's leader lines land on its inset box
    const INSET_PAD         = 6;    // px — padding inside an inset box
    const INSET_GAP         = 8;    // px — gap between neighbouring inset boxes
    const CAPTION_H         = 18;   // px — room under each inset box for its title
    const MIN_LABEL_MAIN    = 500;  // px — the national map shows city labels only when at least this wide
    const KEY_SPACING       = 32;   // px — distance between legend arrows, all equal (the decline's included); as close as the labels allow without touching
    const KEY_SPACING_MIN   = 32;
    const KEY_TITLE_LINE    = 12;   // px — line height of the legend caption

    let containerWidth = $state(null);
    let width = $derived(containerWidth ?? FALLBACK_WIDTH);

    let main   = $derived(frames.find(f => f.id === 'main'));
    let insets = $derived(frames.filter(f => f.id !== 'main').sort((a, b) => a.order - b.order));

    let overlay  = $derived(width >= OVERLAY_MIN_WIDTH);
    let small    = $derived(width < 500);
    let maxLen   = $derived(Math.min(70, Math.max(38, width * 0.10)));    // px length of the longest arrow
    let fontSize = $derived(small ? 11 : 12);
    let keyBoxH  = $derived(maxLen + 30 + KEY_TITLE_LINE);   // legend strip on phones; always room for a two-line caption so nothing shifts when it changes

    const valueOf   = (c) => (measure === 'real' ? c.real_pct : c.pct_change);
    let classBreaks = $derived(measure === 'real' ? classBreaksReal : classBreaksNominal);
    // A decline (v < 0) gets no size class: it is drawn at the shortest length, in its own colour, pointing the other way
    const classOfWith = (v, breaks) => (v < 0 ? 0 : breaks.filter(b => v >= b).length);   // 0 … breaks.length
    const classOf   = (v) => classOfWith(v, classBreaks);
    const lenFor    = (v) => maxLen * CLASS_LEN_FRAC[classOf(v)];
    const strokeFor = (v) => CLASS_STROKE[classOf(v)] * (small ? 0.9 : 1);   // a decline (class 0) is drawn exactly like the 0–10 arrow, just blue and pointing down
    const colorFor  = (v) => (v < 0 ? DECLINE_COLOR : CLASS_COLORS[classOf(v)]);
    // The longest an arrow can be in EITHER view, so the layout (headroom above each frame) is the same in both and nothing moves when the view is switched
    const layoutLen = (c) => maxLen * CLASS_LEN_FRAC[Math.max(classOfWith(c.pct_change, classBreaksNominal), classOfWith(c.real_pct, classBreaksReal))];
    // Short labels (the legend caption carries the % sign): "0–25", "25–50", "50–75", "75+"
    let classLabels = $derived(classBreaks.map((b, i) => `${i === 0 ? 0 : classBreaks[i - 1]}–${b}`).concat(`${classBreaks[classBreaks.length - 1]}+`));
    // A value inside each class, used to draw the legend arrows
    let classKeyValues = $derived.by(() => {
        const b = classBreaks, last = b.length - 1;
        return [b[0] * 0.6, ...b.slice(1).map((v, i) => (b[i] + v) / 2), b[last] + (b[last] - (b[last - 1] ?? 0)) * 0.6];
    });

    // Headroom above a frame = just enough that its tallest glyph tip stays inside the frame
    function headroomFor(points, top, k) {
        return Math.ceil(Math.max(
            TIP_GAP,
            ...points.map(p => layoutLen(cities[p.i]) - (top - p.y) * k + TIP_GAP),
        ));
    }

    // Planar km → px. geoIdentity is x' = k·x + tx, y' = −k·y + ty once reflectY is on.
    // (x0, y1) is the frame coordinate that lands at the pixel (left, top).
    function makeProjection(x0, y1, k, left, top) {
        return geoIdentity().reflectY(true).scale(k).translate([left - x0 * k, top + y1 * k]);
    }

    // ── Layout ────────────────────────────────────────────────────────────────
    // Desktop: national map on top; Southern BC sits in the blank space just south of BC; Southern Ontario and Southern
    // Quebec span the full width in one row underneath; the legend fills the blank space between the BC box and Ontario's outline.
    // Phone: the legend is a strip above the map and the insets pack into two rows.

    let layout = $derived.by(() => {
        const innerW = width - PAD_X * 2;

        const keyH    = overlay ? 0 : keyBoxH;
        const kMain   = innerW / (main.extent[2] - main.extent[0]);
        const mainH   = (main.extent[3] - main.extent[1]) * kMain;
        const mainTop = keyH + headroomFor(main.points, main.extent[3], kMain);
        const mainBottom = mainTop + mainH;
        const mainProj = makeProjection(main.extent[0], main.extent[3], kMain, PAD_X, mainTop);

        // Box size for one inset at scale k
        const size = (f, k) => {
            const hr = Math.max(INSET_PAD, headroomFor(f.points, f.fit[3], k));
            const mapH = (f.fit[3] - f.fit[1]) * k;
            return { f, k, hr, mapH, bw: (f.fit[2] - f.fit[0]) * k + INSET_PAD * 2, bh: hr + mapH + INSET_PAD };
        };

        const boxes = [];
        let y = mainBottom + (overlay ? 16 + KEY_TITLE_LINE : 12);
        let bcBox = null;

        if (overlay) {
            const bc = insets.find(f => f.id === 'bc');
            if (bc) {
                const ringBottom = Math.max(...bc.region.map(pt => mainProj(pt)[1]));
                const k = (Math.max(innerW * BC_WIDTH_FRAC, BC_MIN_WIDTH) - INSET_PAD * 2) / (bc.fit[2] - bc.fit[0]);
                const s = size(bc, k);
                bcBox = { x: PAD_X, y: ringBottom + BC_GAP, w: s.bw, h: s.bh };
                boxes.push({ ...s, box: bcBox });
                y = Math.max(y, bcBox.y + bcBox.h + CAPTION_H + 6);
            }
        }

        const rest = insets.filter(f => !(overlay && f.id === 'bc'));
        const rowGroups = overlay ? [rest] : [0, 1].map(r => insets.filter(f => f.row === r)).filter(r => r.length);

        for (const row of rowGroups) {
            // Box widths are proportional to each inset's visible width times its zoom factor
            const fitW = f => (f.fit[2] - f.fit[0]) * (f.zoom ?? 1);
            const rowW = overlay ? innerW * ROW_WIDTH_FRAC : innerW;
            const avail = rowW - (row.length - 1) * INSET_GAP - row.length * INSET_PAD * 2;
            const kBase = avail / row.reduce((sum, f) => sum + fitW(f), 0);

            const sized = row.map(f => size(f, kBase * (f.zoom ?? 1)));
            // every box in a row gets the row's height; spare height is split above/below the map
            const rowH = Math.max(...sized.map(s => s.bh));
            let x = PAD_X;
            for (const s of sized) {
                boxes.push({ ...s, hr: s.hr + (rowH - s.bh) / 2, box: { x, y, w: s.bw, h: rowH } });
                x += s.bw + INSET_GAP;
            }
            y += rowH + CAPTION_H + 6;
        }

        return { kMain, mainH, mainTop, mainBottom, keyH, boxes, bcBox, mainProj, height: y - 6 };
    });

    // ── Glyphs ────────────────────────────────────────────────────────────────

    let theta = $derived((tiltDeg * Math.PI) / 180);
    let ux = $derived(Math.sin(theta));    // unit vector along the arrow (screen coords, y down)
    let uy = $derived(-Math.cos(theta));
    let px = $derived(Math.cos(theta));    // perpendicular to it
    let py = $derived(Math.sin(theta));

    // One arrow at pixel (x, y) for value v. Shared by the data arrows and the legend.
    function makeGlyph(x, y, v) {
        const cls = classOf(v);
        const len = lenFor(v);
        const sw = strokeFor(v);
        const dir = v < 0 ? -1 : 1;                              // a decline points the opposite way (down and to the left)
        const dx = dir * ux, dy = dir * uy;
        const tipX = x + dx * len, tipY = y + dy * len;
        const head = Math.min(len, 2.4 * sw + 3.2);
        const hw = head * 0.36;
        const baseX = tipX - dx * head, baseY = tipY - dy * head;   // where the head meets the shaft
        const pad = 6;
        const g = {
            x, y, len, v, cls, sw, tipX, tipY, color: colorFor(v),
            radius: sw * 0.9 + 0.6,
            shaft: { x1: x, y1: y, x2: baseX + dx, y2: baseY + dy },
            points: `${tipX},${tipY} ${baseX + px * hw},${baseY + py * hw} ${baseX - px * hw},${baseY - py * hw}`,
            hitMinX: Math.min(x, tipX) - pad, hitW: Math.abs(tipX - x) + pad * 2,
            hitMinY: Math.min(y, tipY) - pad, hitH: Math.abs(tipY - y) + pad * 2,
            samples: [],
        };
        for (let t = 0; t <= len; t += 5) g.samples.push([x + dx * t, y + dy * t, sw / 2 + 1]);
        return g;
    }

    // ── Label placement ───────────────────────────────────────────────────────
    // Labels are tried in priority order (major cities first). Each is put at the nearest free spot around its OWN city dot
    // (arrows lean up-right, so the clear sides are usually right, left and below), rejecting any spot that
    //   • hits an arrow or an already-placed label, or
    //   • sits closer to another city's dot than to its own (which would read as that city's label).
    // If no spot within MAX_LABEL_DIST fits, the label is left off — hover / tap still names the city.

    const SHAFT_CLEARANCE = 9;   // px along an arrow from its dot that stays off-limits to other cities' labels, even when crossings are tolerated
    const MAX_LABEL_DIST = 34;   // px — farthest the nearest edge of a label may be from its dot
    const LEADER_MIN = 8;        // px — a label further than this from its dot gets a thin leader line, so there is no doubt whose it is
    const CLEAR_MARGIN = 2.5;    // px — in the first passes the label must be at least this much nearer its own dot than to any other dot

    function rectHitsCircle(r, cx, cy, rad) {
        const nx = Math.max(r[0], Math.min(cx, r[2])), ny = Math.max(r[1], Math.min(cy, r[3]));
        return (nx - cx) ** 2 + (ny - cy) ** 2 < rad * rad;
    }
    const distToRect = (r, px, py) => Math.hypot(Math.max(r[0] - px, 0, px - r[2]), Math.max(r[1] - py, 0, py - r[3]));

    function placeLabels(glyphs, order, bounds, reserved = []) {
        const byIndex = new Map(glyphs.map(g => [g.i, g]));
        const allSamples = glyphs.flatMap(g => g.samples.map(s => ({ s, owner: g.i, t: Math.hypot(s[0] - g.x, s[1] - g.y) })));
        const placed = [...reserved], labels = [];
        const cw = fontSize * 0.52;

        for (const entry of order) {
            const g = byIndex.get(entry.i);
            if (!g || g.faint) continue;
            const text = entry.text ?? cities[g.i].city;
            const w = text.length * cw + 2;

            // Every spot beside / below / above the dot, nearest first
            const spots = [];
            for (const dy of [4, 15, -6, 26, -17, 37, -28, 48, -39]) {
                spots.push({ anchor: 'start', x: g.x + 7, y: g.y + dy, x0: g.x + 7 });
                spots.push({ anchor: 'end',   x: g.x - 7, y: g.y + dy, x0: g.x - 7 - w });
            }
            for (const dy of [16, 28, 40, 52]) {
                spots.push({ anchor: 'middle', x: g.x,     y: g.y + dy, x0: g.x - w / 2 });
                spots.push({ anchor: 'start',  x: g.x + 4, y: g.y + dy, x0: g.x + 4 });
                spots.push({ anchor: 'end',    x: g.x - 4, y: g.y + dy, x0: g.x - 4 - w });
            }
            for (const c of spots) {
                c.r = [c.x0, c.y - fontSize + 2, c.x0 + w, c.y + 2];
                // closeness = gap between the dot and the label's nearest edge (so long names aren't penalised), centre distance as a tie-break
                c.d = distToRect(c.r, g.x, g.y) + 0.02 * Math.hypot((c.r[0] + c.r[2]) / 2 - g.x, (c.r[1] + c.r[3]) / 2 - g.y);
            }
            spots.sort((a, b) => a.d - b.d);

            // Tried in order: (1) touches nothing and is clearly nearest its own dot; (2) the same, with the margin waived;
            // then, major cities only, (3)/(4) the same again but a spot may cross another city's arrow shaft — never its dot, never this
            // city's own arrow — because the label's white halo keeps it readable and a missing major city reads worse than a crossing.
            const passes = entry.major
                ? [{ cross: false, margin: CLEAR_MARGIN }, { cross: false, margin: 0 }, { cross: true, margin: CLEAR_MARGIN }, { cross: true, margin: 0 },
                   { cross: true, margin: null, maxD: 60 }]   // last resort for a major city: anywhere it fits, tied to its dot by a leader line
                : [{ cross: false, margin: CLEAR_MARGIN }, { cross: false, margin: 0 }];
            let done = false;
            for (const pass of passes) {
                for (const c of spots) {
                    if (c.d > (pass.maxD ?? MAX_LABEL_DIST)) break;
                    const r = c.r;
                    if (r[0] < bounds.x0 || r[2] > bounds.x1 || r[1] < bounds.y0 || r[3] > bounds.y1) continue;
                    if (placed.some(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1])) continue;
                    if (allSamples.some(({ s, owner, t }) => {
                        if (!rectHitsCircle(r, s[0], s[1], s[2])) return false;
                        if (owner === g.i) return t >= 6;                     // a glyph's own first few pixels (its base) don't count against its label
                        return !pass.cross || t < SHAFT_CLEARANCE;
                    })) continue;
                    const own = distToRect(r, g.x, g.y);
                    const nx = Math.max(r[0], Math.min(g.x, r[2])), ny = Math.max(r[1], Math.min(g.y, r[3]));   // the point of the label nearest the dot
                    if (pass.margin !== null) {
                        if (own > LEADER_MIN) {
                            // a leader line will tie this label to its dot, so it may sit further away — but the line must not run past another city's dot,
                            // and no other dot may touch the label
                            const segLen2 = (nx - g.x) ** 2 + (ny - g.y) ** 2 || 1;
                            if (glyphs.some(o => {
                                if (o.i === g.i) return false;
                                if (distToRect(r, o.x, o.y) < 4) return true;
                                const t = Math.max(0, Math.min(1, ((o.x - g.x) * (nx - g.x) + (o.y - g.y) * (ny - g.y)) / segLen2));
                                return Math.hypot(o.x - (g.x + t * (nx - g.x)), o.y - (g.y + t * (ny - g.y))) < o.radius + 3;
                            })) continue;
                        } else {
                            // right beside its dot: no other city's dot may be as near to the label as ours
                            const cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
                            const ownC = Math.hypot(cx - g.x, cy - g.y);
                            if (glyphs.some(o => {
                                if (o.i === g.i) return false;
                                const d = distToRect(r, o.x, o.y);
                                if (pass.margin > 0) return d < own + pass.margin;
                                return d < own - 0.5 || (Math.abs(d - own) <= 0.5 && Math.hypot(cx - o.x, cy - o.y) <= ownC);
                            })) continue;
                        }
                    }
                    placed.push(r);
                    // far from its dot? a thin leader line makes the attribution explicit
                    let lead = null;
                    if (own > LEADER_MIN) {
                        const len = Math.hypot(nx - g.x, ny - g.y) || 1;
                        const gapStart = g.radius + 1.5;
                        lead = { x1: g.x + (nx - g.x) / len * gapStart, y1: g.y + (ny - g.y) / len * gapStart, x2: nx - (nx - g.x) / len * 1.5, y2: ny - (ny - g.y) / len * 1.5 };
                    }
                    labels.push({ key: g.i, x: c.x, y: c.y, anchor: c.anchor, text, lead });
                    done = true;
                    break;
                }
                if (done) break;
            }
        }
        return labels;
    }

    function buildFrame(f, projection, bounds, showLabels, isMain, reserved = []) {
        const glyphs = f.points.map(p => {
            const [x, y] = projection([p.x, p.y]);
            return { ...makeGlyph(x, y, valueOf(cities[p.i])), i: p.i, faint: isMain && p.in_inset };
        });
        // Longest first, so shorter glyphs draw on top where they overlap; faint (inset-covered) ones sit underneath
        glyphs.sort((a, b) => (b.faint - a.faint) || (b.v - a.v));
        const pathGen = geoPath(projection);
        return {
            id: f.id, glyphs,
            labels: showLabels ? placeLabels(glyphs, f.labels, bounds, reserved) : [],
            paths: f.provinces.features.map(ft => pathGen(ft)),
        };
    }

    // Everything the SVG draws, derived from the layout above
    let drawn = $derived.by(() => {
        const L = layout;
        const mainProj = L.mainProj;
        // On desktop the BC box sits over part of the national map's blank margin: keep national labels out from under it (and its caption)
        const mainReserved = L.bcBox ? [[L.bcBox.x - 2, L.bcBox.y - 2, L.bcBox.x + L.bcBox.w + 2, L.bcBox.y + L.bcBox.h + CAPTION_H + 4]] : [];
        const mainFrame = buildFrame(main, mainProj,
            { x0: 0, x1: width, y0: L.keyH, y1: L.mainBottom }, width >= MIN_LABEL_MAIN, true, mainReserved);

        const insetFrames = L.boxes.map(b => {
            const proj = makeProjection(b.f.fit[0], b.f.fit[3], b.k, b.box.x + INSET_PAD, b.box.y + b.hr);
            const bounds = { x0: b.box.x + 2, x1: b.box.x + b.box.w - 2, y0: b.box.y + 2, y1: b.box.y + b.box.h - 2 };
            // keep labels clear of the north arrow (drawn only where the inset is rotated)
            const rot = (b.f.rotation * Math.PI) / 180;
            const north = b.f.rotation
                ? { x: b.box.x + b.box.w - 22, y: b.box.y + b.box.h - 18, dx: -Math.sin(rot), dy: -Math.cos(rot) }
                : null;
            const reserved = north
                ? [[north.x - 10, north.y - 26, north.x + 10, north.y + 8]]
                : [];
            const fr = buildFrame(b.f, proj, bounds, true, false, reserved);

            // outline of this inset's region on the national map + leader lines to the box (desktop only)
            const ring = b.f.region.map(([x, y]) => mainProj([x, y]));
            const low = [...ring].sort((a, c) => c[1] - a[1]).slice(0, 2).sort((a, c) => a[0] - c[0]);   // two lowest corners, left → right
            // Lines land on the box's top edge just outside the region's own width (clamped to the box), so they stay short and don't sweep across the map
            const land = (x) => Math.max(b.box.x, Math.min(b.box.x + b.box.w, x));
            const lines = overlay ? [
                { x1: low[0][0], y1: low[0][1], x2: land(low[0][0] - LEADER_SPREAD), y2: b.box.y },
                { x1: low[1][0], y1: low[1][1], x2: land(low[1][0] + LEADER_SPREAD), y2: b.box.y },
            ] : [];
            return {
                ...fr, title: b.f.title, box: b.box, lines, north, ringMaxX: Math.max(...ring.map(p => p[0])), ringPts: ring,
                ring: 'M' + ring.map(p => p.join(',')).join('L') + 'Z',
            };
        });

        // Legend: desktop → blank US-side space between the BC box and Ontario's outline, bottom-aligned with the BC box;
        // phone → strip above the national map
        let origin, spacing = KEY_SPACING;
        // The legend: a decline arrow first (in both views, so the legend never changes shape), then the size classes
        const keyItems = [
            { v: -1, label: 'Decline' },
            ...classKeyValues.map((v, j) => ({ v, label: classLabels[j] })),
        ];
        const n = keyItems.length - 1;
        const keyW = (j) => j * spacing;    // x offset of legend slot j: every slot the same distance apart, the decline's included
        if (overlay && L.bcBox) {
            // Right edge of the plot, over the Atlantic. Spacing shrinks on narrower screens so the legend stays clear of Quebec's outline —
            // measured where the legend actually is (the outline's lower part), not at its far corner higher up.
            const keyTop = L.mainBottom - 20 - maxLen * CLASS_LEN_FRAC[0] - 8;   // the legend's first slot holds the shortest arrow, so only the outline's part below that matters
            let ringRight = -Infinity;
            for (const f of insetFrames.filter(f => f.id !== 'bc')) {
                f.ringPts.forEach(([x1, y1], i) => {
                    const [x2, y2] = f.ringPts[(i + 1) % f.ringPts.length];
                    for (let t = 0; t <= 1; t += 0.05) if (y1 + (y2 - y1) * t >= keyTop) ringRight = Math.max(ringRight, x1 + (x2 - x1) * t);
                });
            }
            if (!isFinite(ringRight)) ringRight = Math.max(...insetFrames.filter(f => f.id !== 'bc').map(f => f.ringMaxX));
            const rightEdge = width - PAD_X - 14;
            spacing = Math.max(KEY_SPACING_MIN, Math.min(KEY_SPACING, (rightEdge - 14 - ringRight) / n));
            origin = { x: rightEdge - keyW(n), y: L.mainBottom - 20 };
        } else if (overlay) {
            origin = { x: PAD_X + 14, y: L.mainBottom - 22 };
        } else {
            origin = { x: PAD_X + 14, y: L.keyH - 30 - KEY_TITLE_LINE };
        }
        // Each arrow is centred on its slot (the labels sit under the slot centre); a downward arrow starts higher, so the whole arrow sits above the legend's baseline like the others
        const key = keyItems.map((it, j) => {
            const dir = it.v < 0 ? -1 : 1, len = lenFor(it.v);
            const slotX = origin.x + keyW(j);
            return {
                ...makeGlyph(slotX - dir * ux * len / 2, it.v < 0 ? origin.y - Math.abs(uy) * len : origin.y, it.v),
                label: it.label, lx: slotX - (it.v < 0 ? 5 : 0),   // "Decline" is the widest label: nudged left so it never runs into "0–10"
            };
        });
        const keyTitleX = overlay ? origin.x + keyW(n) + 18 : origin.x - 18;
        return { mainFrame, insetFrames, key, origin, keyTitleX };
    });

    // Unique ids so several maps on one page don't collide
    const uid = Math.random().toString(36).slice(2, 8);

    // ── Tooltip ───────────────────────────────────────────────────────────────

    let tooltip = $state(null); // { clientX, clientY, city } or null

    function showTooltip(e, g) {
        tooltip = { clientX: e.clientX, clientY: e.clientY, city: cities[g.i] };
    }

    const fmtPct = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%';
</script>

{#snippet shape(g)}
    <line class="shape" x1={g.shaft.x1} y1={g.shaft.y1} x2={g.shaft.x2} y2={g.shaft.y2} stroke={g.color} stroke-width={g.sw} stroke-linecap="round" />
    <circle class="shape" cx={g.x} cy={g.y} r={g.radius} fill={g.color} stroke="white" stroke-width="0.6" />
    <polygon class="shape" points={g.points} fill={g.color} stroke="white" stroke-width="0.6" stroke-linejoin="round" />
{/snippet}

{#snippet glyphLayer(frame)}
    {#each frame.glyphs as g (g.i)}
        {#if g.faint}
            <!-- Covered by an inset: drawn lightly for the national picture, no hover (the inset carries the detail) -->
            <g class="faint">{@render shape(g)}</g>
        {:else}
            <g class="glyph">
                {@render shape(g)}
                <!-- Invisible hit area: wider + minimum height for easy hover/tap -->
                <rect
                    x={g.hitMinX}
                    y={g.hitMinY}
                    width={g.hitW}
                    height={g.hitH}
                    fill="transparent"
                    style="cursor: pointer"
                    role="button"
                    tabindex="0"
                    aria-label="{cities[g.i].city}: {fmtPct(g.v)}"
                    onmouseenter={(e) => showTooltip(e, g)}
                    onmouseleave={() => (tooltip = null)}
                    onclick={(e) => { e.stopPropagation(); showTooltip(e, g); }}
                    onkeydown={(e) => {
                        if (e.key === 'Enter') {
                            const r = e.currentTarget.getBoundingClientRect();
                            showTooltip({ clientX: r.left + r.width / 2, clientY: r.top }, g);
                        }
                    }}
                />
            </g>
        {/if}
    {/each}

    {#each frame.labels as l (l.key)}
        {#if l.lead}<line class="label-leader" x1={l.lead.x1} y1={l.lead.y1} x2={l.lead.x2} y2={l.lead.y2} />{/if}
        <text class="chart-axis-label city-label" x={l.x} y={l.y} text-anchor={l.anchor}>{l.text}</text>
    {/each}
{/snippet}

<div class="glyph-map" bind:offsetWidth={containerWidth} onclick={() => (tooltip = null)} role="presentation">
    <svg {width} height={layout.height} role="img" aria-label={ariaLabel}>
        <defs>
            <!-- Soft fade where the national map's northern crop cuts through land -->
            <linearGradient id="fade-{uid}" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={layout.mainTop} y2={layout.mainTop + layout.mainH * FADE_FRACTION}>
                <stop offset="0" stop-color="white" stop-opacity="0" />
                <stop offset="1" stop-color="white" stop-opacity="1" />
            </linearGradient>
            <mask id="mask-{uid}">
                <rect x="0" y={layout.mainTop} {width} height={layout.mainH} fill="url(#fade-{uid})" />
            </mask>
            {#each drawn.insetFrames as f}
                <clipPath id="clip-{f.id}-{uid}">
                    <rect x={f.box.x} y={f.box.y} width={f.box.w} height={f.box.h} />
                </clipPath>
            {/each}
        </defs>

        <!-- National map -->
        <g mask="url(#mask-{uid})">
            {#each drawn.mainFrame.paths as d}
                <path {d} fill="#e2e2e2" stroke="white" stroke-width="0.5" />
            {/each}
        </g>

        <!-- Legend: the size / colour classes (plus a decline arrow when a city is below zero) -->
        <g class="key">
            {#each drawn.key as g}
                {@render shape(g)}
                <text class="chart-axis-label key-label" x={g.lx} y={drawn.origin.y + 14} text-anchor="middle">{g.label}</text>
            {/each}
            <text class="chart-axis-label key-label key-title" x={drawn.keyTitleX} y={drawn.origin.y + 28} text-anchor={overlay ? 'end' : 'start'}>
                {#each keyTitle as line, i}<tspan x={drawn.keyTitleX} dy={i === 0 ? 0 : KEY_TITLE_LINE}>{line}</tspan>{/each}
            </text>
        </g>

        <!-- Where each inset comes from -->
        {#each drawn.insetFrames as f}
            {#each f.lines as ln}
                <line class="leader" x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} />
            {/each}
            <path class="region-box" d={f.ring} />
        {/each}

        {@render glyphLayer(drawn.mainFrame)}

        <!-- Insets -->
        {#each drawn.insetFrames as f}
            <rect class="inset-box" x={f.box.x} y={f.box.y} width={f.box.w} height={f.box.h} />
            <g clip-path="url(#clip-{f.id}-{uid})">
                {#each f.paths as d}
                    <path {d} fill="#e2e2e2" stroke="white" stroke-width="0.5" />
                {/each}
                {@render glyphLayer(f)}
                {#if f.north}
                    <g class="north" transform="translate({f.north.x} {f.north.y})">
                        <line x1="0" y1="0" x2={f.north.dx * 12} y2={f.north.dy * 12} />
                        <polygon points="0,-4 3,2 -3,2" transform="translate({f.north.dx * 12} {f.north.dy * 12}) rotate({Math.atan2(f.north.dx, -f.north.dy) * 180 / Math.PI})" />
                        <text class="chart-axis-label" x={f.north.dx * 21} y={f.north.dy * 21 + 4} text-anchor="middle">N</text>
                    </g>
                {/if}
            </g>
            <text class="chart-axis-label inset-title" x={f.box.x} y={f.box.y + f.box.h + 14}>{f.title}</text>
        {/each}
    </svg>

    {#if tooltip}
        {@const c = tooltip.city}
        <MapTooltip
            x={tooltip.clientX}
            y={tooltip.clientY}
            title={`${c.city}, ${c.prov}`}
            width={276}
            ondismiss={() => (tooltip = null)}
        >
            <RentTooltipBody
                nominalPct={c.pct_change}
                realPct={c.real_pct}
                baseRent={c.base_rent}
                latestRent={c.latest_rent}
                realBaseRent={c.real_base_rent}
                {realYear}
                {baseQuarter}
                {latestQuarter}
                {measure}
                {scaleUp}
                {scaleDown}
            />
        </MapTooltip>
    {/if}
</div>

<style>
    /* Axis, tick and key labels. The original page defined this as a global class; here it is local to the component. Kept first so the rules below win, as the global one did. */
    .chart-axis-label { font-family: OpenSans, sans-serif; font-size: 12px; fill: var(--brandGray70); }
    @media (max-width: 600px) { .chart-axis-label { font-size: 11px; } }

    .glyph-map { width: 100%; min-width: 250px; position: relative; }
    svg { display: block; overflow: visible; }

    .shape { opacity: 0.9; transition: opacity 0.15s ease; }
    .glyph:hover .shape { opacity: 1; }
    .faint { opacity: 0.32; pointer-events: none; }

    .region-box {
        fill: none;
        stroke: var(--brandGray60);
        stroke-width: 1;
        stroke-dasharray: 3 3;
        pointer-events: none;
    }
    .leader {
        stroke: var(--brandGray50);
        stroke-width: 0.75;
        pointer-events: none;
    }
    .inset-box {
        fill: white;
        stroke: var(--brandGray60);
        stroke-width: 1;
    }
    .inset-title { fill: var(--brandGray90); font-family: OpenSansBold; }
    .key-label { fill: var(--brandGray70); font-size: 10.5px; }
    .key-title { font-family: OpenSansBold; }

    .north line { stroke: var(--brandGray60); stroke-width: 1.2; }
    .north polygon { fill: var(--brandGray60); }
    .north text { fill: var(--brandGray70); }

    .label-leader { stroke: var(--brandGray60); stroke-width: 0.75; pointer-events: none; }

    /* Halo keeps labels legible over spikes and borders */
    .city-label {
        pointer-events: none;
        paint-order: stroke;
        stroke: white;
        stroke-width: 3px;
        stroke-linejoin: round;
    }
</style>
