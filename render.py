#!/usr/bin/env python3
"""Render card.html to entry.png at 1024x1024, offline, deterministically."""

import os
import struct
import sys

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
CARD = "file://" + os.path.join(HERE, "card.html")
OUT = os.path.join(HERE, "entry.png")
SIDE = 1024

if not os.path.exists(os.path.join(HERE, "card.html")):
    raise SystemExit("card.html is missing next to render.py")

problems = []


def main() -> int:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--force-color-profile=srgb"])
        page = browser.new_page(viewport={"width": SIDE, "height": SIDE},
                                device_scale_factor=1)
        page.on("pageerror", lambda exc: problems.append("pageerror: %s" % exc))
        page.on("console", lambda msg: problems.append("console %s: %s" % (msg.type, msg.text))
                if msg.type == "error" else None)
        page.on("requestfailed", lambda req: problems.append("requestfailed: %s" % req.url))

        page.goto(CARD, wait_until="load")
        page.wait_for_timeout(600)

        # a stray script or bad markup must not pass silently
        if problems:
            raise RuntimeError("page reported errors:\n  " + "\n  ".join(problems))

        page.screenshot(path=OUT, clip={"x": 0, "y": 0, "width": SIDE, "height": SIDE},
                        animations="disabled")
        browser.close()

    with open(OUT, "rb") as fh:
        blob = fh.read()

    if blob[:8] != b"\x89PNG\r\n\x1a\n":
        raise RuntimeError("entry.png is not a PNG")

    width, height = struct.unpack(">II", blob[16:24])
    if (width, height) != (SIDE, SIDE):
        raise RuntimeError("expected %dx%d, got %dx%d" % (SIDE, SIDE, width, height))
    if len(blob) > 1048576:
        print("warning: entry.png exceeds 1 MiB", file=sys.stderr)

    print("entry.png %dx%d %d bytes" % (width, height, len(blob)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
