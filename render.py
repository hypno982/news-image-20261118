"""Render the 18 November 2026 world-news summary card to entry.png.

Draws in a headless Chromium at exactly 1024x1024, so the PNG is the browser's own
render of real text and layout (no upscaling, no compositing of borrowed pictures).
Deterministic: fixed viewport, fixed fonts, no animation, no network.
"""
import asyncio
import os
import sys

from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, "card.html")
OUT = os.path.join(HERE, "entry.png")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--force-device-scale-factor=1", "--hide-scrollbars"])
        page = await browser.new_page(viewport={"width": 1024, "height": 1024}, device_scale_factor=1)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto("file://" + HTML, wait_until="load")
        await page.wait_for_timeout(600)
        await page.screenshot(path=OUT, type="png", clip={"x": 0, "y": 0, "width": 1024, "height": 1024})
        await browser.close()
        if errors:
            print("PAGE ERRORS:", errors, file=sys.stderr)
            return 1
    print("wrote", OUT, os.path.getsize(OUT), "bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
