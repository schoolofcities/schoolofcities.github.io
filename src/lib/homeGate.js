// A courtesy gate on the home page while it is under development, like the one on a post that is
// still in progress (see Password.svelte): not real security. The password is in the page's
// JavaScript, and what it hides is only the page's content, not the site's files. It exists so a
// link to the unfinished page doesn't get casually forwarded or indexed.
//
// While it is on, the home page asks search engines not to index it, leaves out its structured
// data, and drops out of the sitemap (a page that asks not to be indexed shouldn't be listed there).
// Set HOME_PROTECTED to false to open the page up; the rest follows.

export const HOME_PROTECTED = true;
export const HOME_PASSWORD = 'catcatmeow';
