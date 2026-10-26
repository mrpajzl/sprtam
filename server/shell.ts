// The app's HTML for routes without a page of their own (quiz, search, …): no canonical, kept out of search
// results. Written to dist/app.html at build time (the service worker's offline fallback) and served by
// the server with the current manifest embedded.
export const shell = (template: string) => template.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
