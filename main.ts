// news-image-20261118 — "Sum up 18 November's world news in one image".
//
// entry.png beside this file is the whole entry: a 1024x1024 PNG that render.py produced from
// card.html in a headless Chromium — real type and vector icons laid out at a fixed viewport,
// no network, no animation, no borrowed pictures. The card carries the date in three places
// (masthead line, numeral block, orange footer chip) over four full-width story rows: the US
// Senate seat in Alaska, the Xi-Putin summit with Trump arriving, Waymo's robotaxi halt after
// California, and Australia's sanctions on Israeli settlers over the West Bank. One small line
// under the rows names two further stories, so the card shows the day's breadth without
// shrinking the four main rows.
//
// This program copies entry.png to $MAKEFUN_OUTPUT_DIR/entry.png (default /output). It reads
// the file once into memory and writes exactly those bytes — no re-encoding, no timestamp, no
// metadata rewrite — so repeated runs are byte-identical.
//
// Before writing, and again on the copy it just wrote, it proves the file is a whole PNG by
// walking the chunk stream: the 8-byte signature, an IHDR first chunk carrying the dimensions,
// and a zero-length IEND that ends exactly at EOF. A truncated render loses IEND; a malformed
// one trips a chunk length; a concatenated one leaves trailing bytes. Size above 1 MiB — the
// grader's cap — only earns a warning on stderr, because the deterministic renderer sits far
// below it and a hard failure there would be a false alarm.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const SOURCE = join(HERE, 'entry.png');
const TARGET = join(OUTPUT_DIR, 'entry.png');

const MIB = 1024 * 1024;
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IHDR_PAYLOAD = 13;
const CHUNK_OVERHEAD = 12; // 4 length + 4 type + 4 CRC

type Dimensions = { width: number; height: number };

// Walk the chunk stream from the signature to IEND. Lengths are 32-bit big-endian and count
// the payload only, so each chunk spans 12 + length bytes.
function assertWholePng(bytes: Buffer, label: string): Dimensions {
  if (bytes.length < SIGNATURE.length + CHUNK_OVERHEAD + IHDR_PAYLOAD + CHUNK_OVERHEAD) {
    throw new Error(`${label} is not a PNG: only ${bytes.length} bytes`);
  }
  if (!bytes.subarray(0, SIGNATURE.length).equals(SIGNATURE)) {
    throw new Error(`${label} is not a PNG: signature missing`);
  }

  let at = SIGNATURE.length;
  let dimensions: Dimensions | undefined;
  let sawIend = false;

  while (at + CHUNK_OVERHEAD <= bytes.length) {
    const length = bytes.readUInt32BE(at);
    const type = bytes.toString('latin1', at + 4, at + 8);
    const next = at + CHUNK_OVERHEAD + length;
    if (next > bytes.length) {
      throw new Error(`${label} is truncated: chunk ${type} at ${at} runs past end of file`);
    }
    if (!dimensions) {
      // IHDR must come first, once, and it is the only place the dimensions live.
      if (type !== 'IHDR' || length !== IHDR_PAYLOAD) {
        throw new Error(`${label} is not a PNG: first chunk is ${type}, not IHDR`);
      }
      dimensions = { width: bytes.readUInt32BE(at + 8), height: bytes.readUInt32BE(at + 12) };
    }
    at = next;
    if (type === 'IEND') {
      if (length !== 0) throw new Error(`${label} has a malformed IEND chunk`);
      sawIend = true;
      break;
    }
  }

  if (!sawIend) throw new Error(`${label} is truncated: no closing IEND chunk`);
  if (at !== bytes.length) throw new Error(`${label} has ${bytes.length - at} bytes after IEND`);
  return dimensions!;
}

const bytes = readFileSync(SOURCE);
const { width, height } = assertWholePng(bytes, 'entry.png');

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(TARGET, bytes);

// Re-read what landed on disk: same bytes, still a whole PNG.
const written = readFileSync(TARGET);
if (!written.equals(bytes)) {
  throw new Error(`${TARGET} does not match entry.png after copying`);
}
assertWholePng(written, TARGET);

const size = written.length;
if (size > MIB) {
  process.stderr.write(`warning: ${TARGET} is ${size} bytes, above the 1 MiB cap\n`);
}
process.stdout.write(`${TARGET} ${size} bytes ${width}x${height}\n`);
