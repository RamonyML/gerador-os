"""Chroma key magenta (#FF00FF) -> transparent for flat illustrations.

Pure-PIL (no numpy): uses band math so it runs at C speed.
Magenta score = min(R,B) - G  (255 for pure magenta, 0 for greens/keep).

Usage: python chroma_key.py <src.png> <dst.png>
"""
import sys
from PIL import Image, ImageChops

SRC, DST = sys.argv[1], sys.argv[2]
T0, T1 = 55, 135  # score <=T0 keep opaque, >=T1 transparent, linear feather

src = Image.open(SRC).convert("RGB")
R, G, B = src.split()

min_rb = ImageChops.darker(R, B)
score = ImageChops.subtract(min_rb, G)  # clamps negatives to 0


def to_alpha(s: int) -> int:
    if s <= T0:
        return 255
    if s >= T1:
        return 0
    return round(255 * (T1 - s) / (T1 - T0))


alpha = score.point([to_alpha(s) for s in range(256)])

# Edge ring (partial alpha) -> suppress magenta spill by clamping R,B down to G
edge = alpha.point([255 if 0 < a < 255 else 0 for a in range(256)])
R = Image.composite(ImageChops.darker(R, G), R, edge)
B = Image.composite(ImageChops.darker(B, G), B, edge)

out = Image.merge("RGBA", (R, G, B, alpha))

bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)
pad_x = round(out.width * 0.03)
pad_y = round(out.height * 0.03)
padded = Image.new("RGBA", (out.width + 2 * pad_x, out.height + 2 * pad_y), (0, 0, 0, 0))
padded.paste(out, (pad_x, pad_y))

padded.save(DST)
print("saved", DST, padded.size)
