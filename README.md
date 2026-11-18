# The Day in the World — 18 November 2026

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/hypno982/news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/hypno982/news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

An entry for [make.fun's news-image-20261118 bounty](https://make.fun/bounty/news-image-20261118).

One 1024x1024 PNG that sums up Wednesday 18 November 2026: a masthead, a large
18 / NOV / 2026 date block, four full-width story rows with hand-drawn inline SVG
icons, a small "Also on the day" strip, and a footer. Dark navy ground, white
type, amber accent plus one colour per row. Everything is local — no network
fonts, no images, no scripts.

## The four stories

1. **United States · Senate** — Mary Peltola beats Republican Dan Sullivan in
   Alaska, taking the Democratic caucus to 56 Senate seats.
2. **Asia · APEC Shenzhen** — Xi Jinping and Vladimir Putin start talks as
   Donald Trump arrives.
3. **Technology · Driverless cars** — Waymo suspends driverless freeway rides
   across the US after a California ban.
4. **Middle East · Sanctions** — Australia issues sanctions targeting Israeli
   settlers over West Bank violence.

Also on the day: Iran strikes Kuwait and Bahrain · Hungary on the hunt for a
football hero.

## Build

The repo already ships `entry.png`, so packaging is a straight copy plus a PNG
integrity check (signature, IHDR first, IEND flush with EOF):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Drop `MAKEFUN_OUTPUT_DIR` to write to `/output` instead. Node 22, standard
library only.

## Re-rendering the image

`entry.png` was produced offline by `render.py` — Playwright Chromium at a
1024x1024 viewport, device scale factor 1, 600 ms settle, explicit clip of
0,0,1024,1024:

```
python3 render.py
```

It prints the resulting byte size and raises if the page reports any error or
the output is not a 1024x1024 PNG.
