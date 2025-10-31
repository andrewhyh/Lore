// This file previously exported the Pages Router root ("/") and conflicted with the App Router in `src/app`.
// To avoid the App/Pages router conflict during development and deployment, this file no longer
// provides a default page export. Use `src/pages/home.tsx` (non-root) if you need pages-router
// examples.

export const pagesIndexDisabled = true
