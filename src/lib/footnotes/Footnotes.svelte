<script>

    export let footnotes;
    export let footnoteListTitle = "References";

</script>

<div class="footnotes">

    <h2>{footnoteListTitle}</h2>

    {#each footnotes as footnote (footnote.id)}

        <div id={`footnote-${footnote.id}`} class="footnote-item">

            <sup><a href={`#footnote-ref-${footnote.id}`} class="backlink" on:click|preventDefault={() => {
                    const element = document.getElementById(`footnote-ref-${footnote.id}`);
                    const yOffset = -100;
                    if (element) {
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'auto' });
                    }
                }}>
                    <b>[{footnote.id}]</b>
                </a> </sup> 

            <p style="display:inline">{@html footnote.text}

            </p>

            <a href={`#footnote-ref-${footnote.id}`} class="backlink" aria-label="Back to text" on:click|preventDefault={() => {
                    const element = document.getElementById(`footnote-ref-${footnote.id}`);
                    const yOffset = -100;
                    if (element) {
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'auto' });
                    }
                }}>
                    <!-- An SVG rather than the ⮝ character, which many phone fonts lack. -->
                    <svg class="backlink-arrow" viewBox="0 0 10 10" width="12" height="12" aria-hidden="true">
                        <path d="M5 1 L9.5 9 L5 6.5 L0.5 9 Z" fill="currentColor" />
                    </svg>
                </a>

        </div>

    {/each}

</div>

<style>

    .footnotes {
        max-width: 680px;
        margin: 0 auto;
        position: relative;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 0px;
        margin-top: 100px;
        margin-bottom: 50px;
        padding-bottom: 20px;
        border: solid 1px var(--brandGray15);
        /* border-top-right-radius: 50px; */
    }

    .footnotes h2 {
        font-size: 22px;
        font-family: TradeGothicBold, sans-serif;
        font-weight: normal;
        margin-bottom: 15px;
        color: var(--brandBlack);
    }
    
    .footnote-item {
        padding-left: 32px;
        margin-bottom: 17px;
        position: relative;
    }

    .footnote-item sup {
        position: absolute;
        font-size: 14px;
        font-family: OpenSansBold, serif;
        font-weight: normal;
        left: 0;
    }

    .footnote-item p {
        font-size: 17px;
        font-family: SourceSerif, serif;
        font-weight: normal;
        line-height: 24px;
        color: var(--brandGray90);
    }

    /* Space between references in the same footnote: 8px short of a full line. */
    .footnote-item :global(.footnote-gap) {
        display: block;
        height: 16px;
    }

    .backlink-arrow {
        vertical-align: baseline;
    }

    .backlink {
        margin-left: 5px;
        font-family: SourceSerif, serif;
        font-weight: normal;
        text-decoration: none;
        color: var(--brandMedBlue);
    }

    @media screen and (max-width: 600px) {
        .footnote-item p {
            font-size: 15px;
            line-height: 23px;
        }

        .footnote-item :global(.footnote-gap) {
            height: 15px;
        }
    }

    a:hover {
        color: var(--brandLightBlue);
    }
</style>