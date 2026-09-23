#!/usr/bin/env python3
"""Prepare the clean 9.2 rank badge assets without touching legacy files."""

from pathlib import Path
import sys

import numpy as np
from PIL import Image
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "rankforge" / "assets" / "ranks"


def checkerboard_to_alpha(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGB")
    rgb = np.asarray(image).astype(np.float32) / 255.0
    maximum = rgb.max(axis=2)
    minimum = rgb.min(axis=2)
    saturation = np.divide(
        maximum - minimum,
        maximum,
        out=np.zeros_like(maximum),
        where=maximum > 0,
    )

    # Checkerboard cells are bright and essentially achromatic. The badge has a
    # continuous saturated/dark outline; keeping its largest component and filling
    # enclosed highlights removes the background without eating the white facets.
    core = (saturation > 0.075) | (maximum < 0.80)
    core = ndimage.binary_closing(core, iterations=2)
    labels, count = ndimage.label(core)
    if not count:
        raise RuntimeError(f"No foreground component found in {source}")
    sizes = ndimage.sum(core, labels, range(1, count + 1))
    component = labels == (int(np.argmax(sizes)) + 1)
    component = ndimage.binary_fill_holes(component)
    component = ndimage.binary_closing(component, iterations=2)

    # A small feather preserves antialiasing while avoiding the old smoky halo.
    alpha = ndimage.gaussian_filter(component.astype(np.float32), sigma=0.7)
    alpha = np.clip((alpha - 0.04) / 0.92, 0, 1)
    rgba = np.dstack((np.asarray(image), np.rint(alpha * 255).astype(np.uint8)))
    return Image.fromarray(rgba, "RGBA")


def fit_and_save(source: Path, name: str, extract_checkerboard: bool = False) -> None:
    image = checkerboard_to_alpha(source) if extract_checkerboard else Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if not box:
        raise RuntimeError(f"Transparent source has no badge: {source}")
    image = image.crop(box)
    canvas_size = 512
    target_size = 446
    scale = min(target_size / image.width, target_size / image.height)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    canvas.alpha_composite(
        resized,
        ((canvas_size - resized.width) // 2, (canvas_size - resized.height) // 2),
    )
    destination = OUTPUT / f"{name}-v9.2.0.png"
    canvas.save(destination, "PNG", optimize=True)
    print(destination)


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit("usage: prepare-rank-assets.py PLATINUM DIAMOND CHAMPION TITAN")
    fit_and_save(Path(sys.argv[1]), "platinum", extract_checkerboard=True)
    fit_and_save(Path(sys.argv[2]), "diamond")
    fit_and_save(Path(sys.argv[3]), "champion")
    fit_and_save(Path(sys.argv[4]), "titan")


if __name__ == "__main__":
    main()
