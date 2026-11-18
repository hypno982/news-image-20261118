#!/usr/bin/env node
// Ship entry.png: validate it is a whole PNG, then emit exactly those bytes
// into MAKEFUN_OUTPUT_DIR (default "/output").
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const LIMIT = 1048576;

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const to = join(outDir, "entry.png");

// Walk chunks: IHDR first, IEND last and flush with EOF. Returns dimensions.
function checkPng(buf) {
  if (buf.length < 45) throw new Error(`entry.png: only ${buf.length} bytes, not a PNG`);
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error("entry.png: wrong PNG signature");
  if (buf.readUInt32BE(8) !== 13 || buf.toString("latin1", 12, 16) !== "IHDR")
    throw new Error("entry.png: IHDR is not the first chunk");

  let at = 8;
  let count = 0;
  while (at + 8 <= buf.length) {
    const len = buf.readUInt32BE(at);
    const kind = buf.toString("latin1", at + 4, at + 8);
    const next = at + 12 + len;
    if (next > buf.length) throw new Error(`entry.png: ${kind} chunk overruns end of file`);
    count++;
    if (kind === "IEND") {
      if (next !== buf.length) throw new Error(`entry.png: ${buf.length - next} stray bytes after IEND`);
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), count };
    }
    at = next;
  }
  throw new Error("entry.png: truncated, no IEND chunk found");
}

const bytes = readFileSync(from);
const { w, h, count } = checkPng(bytes);

mkdirSync(outDir, { recursive: true });
writeFileSync(to, bytes);

if (bytes.length > LIMIT) {
  process.stderr.write(`warning: entry.png is ${bytes.length} bytes, over the ${LIMIT} byte limit\n`);
}

process.stdout.write(`entry.png ${w}x${h} ${bytes.length} bytes ${count} chunks -> ${to}\n`);
