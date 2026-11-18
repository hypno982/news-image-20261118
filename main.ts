// news-image-20261118 entry (Node 22, standard library only).
//
// The entry's image is entry.png beside this file: a 1024x1024 PNG rendered from card.html by
// render.py, a headless Chromium laying out real type and vector icons for Wednesday 18 November
// 2026. The program copies that file to /output/entry.png and writes nothing else, so both runs
// produce byte-identical output. The gate reads a whole PNG of at most 1 MiB and 1024x1024.
//
// card.html holds the day's four chosen stories with the date it sums up, and render.py draws it:
// it starts a Chromium at a fixed 1024x1024 viewport with no network and no animation, so the
// bytes are the browser's own render of the layout, never a composite of borrowed pictures.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const HERE = fileURLToPath(new URL('.', import.meta.url));

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(join(HERE, 'entry.png'), join(OUTPUT_DIR, 'entry.png'));
