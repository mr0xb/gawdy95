// Assembles the GitHub Pages site in site-dist/: the React demo at the root and the original
// vanilla kitchen sink (index.html + gawdy95.css + gawdy95.js) under vanilla/.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const out = here("../site-dist/");

rmSync(out, { recursive: true, force: true });
cpSync(here("../demo-dist/"), out, { recursive: true });
mkdirSync(here("../site-dist/vanilla/"), { recursive: true });
for (const f of ["index.html", "gawdy95.css", "gawdy95.js"]) cpSync(here(`../../${f}`), here(`../site-dist/vanilla/${f}`));
writeFileSync(here("../site-dist/.nojekyll"), "");
console.log("site-dist/ ready: React demo at /, vanilla demo at /vanilla/");
