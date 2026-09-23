"""Export the approved D+H master unchanged at PWA sizes and lay out iOS launch images."""
from pathlib import Path
import re
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'public/rankforge'
MASTER = ROOT / 'docs/brand-x4/evorank-dh-master.png'
master = Image.open(MASTER).convert('RGB')
assert master.width == master.height

for size in (32, 180, 192, 512):
    master.resize((size, size), Image.Resampling.LANCZOS).save(APP / f'icons/evorank-x4-{size}.png')

# Inset the full artwork to keep the ER inside Android's maskable safe circle.
maskable = Image.new('RGB', (512, 512), '#080808')
maskable.paste(master.resize((400, 400), Image.Resampling.LANCZOS), (56, 56))
maskable.save(APP / 'icons/evorank-x4-maskable-512.png')
shutil.copy2(APP / 'icons/evorank-x4-180.png', APP / 'apple-touch-icon.png')

font_roots = [Path('/usr/share/fonts/truetype/dejavu'), Path('/usr/share/fonts/truetype/liberation2')]
font_path = next((p / name for p in font_roots for name in ('DejaVuSans-Bold.ttf', 'LiberationSans-Bold.ttf') if (p / name).exists()), None)
if font_path is None:
    raise SystemExit('Install DejaVu Sans or Liberation Sans to export the launch images.')

html = (APP / 'index.html').read_text()
screens = set(re.findall(r'evorank-x4-splash-(\d+)x(\d+)@(\d)x\.png', html))
for width, height, scale in sorted(screens):
    w, h, d = int(width), int(height), int(scale)
    canvas = Image.new('RGB', (w * d, h * d), '#080808')
    size = (112 if h <= 600 else 160) * d
    tile = master.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=round(size * .225), fill=255)
    x = (w * d - size) // 2
    # Reserve lower space for the web splash's progress indicators after launch.
    y = round(h * d / 2 - (size + 100 * d) / 2)
    canvas.paste(tile, (x, y), mask)
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(font_path), 30 * d)
    draw.text((w * d / 2, y + size + 24 * d), 'EvoRank', font=font, fill='#f5f5f5', anchor='mt')
    canvas.save(APP / f'splash/evorank-x4-splash-{w}x{h}@{d}x.png')

print(f'Exported 5 app icons, Apple fallback, and {len(screens)} iPhone launch images.')
