"""Normaliza ilustrações de hub para um canvas padrão (mesmo tamanho de render).

A HeroIllustration renderiza com largura fixa (maxWidth) e height: auto, então o
tamanho visual depende SOMENTE da proporção do PNG. Para que todas as ilustrações
rendam no mesmo tamanho, encaixamos o conteúdo (contain, centralizado) num canvas
WxH fixo e transparente, com uma margem consistente.

Opera sobre PNGs já transparentes (recorta pelo bounding box do alpha).

Usage: python normalize_illustration.py <src.png> <dst.png> <W> <H>
"""
import sys
from PIL import Image

SRC, DST = sys.argv[1], sys.argv[2]
TARGET_W, TARGET_H = int(sys.argv[3]), int(sys.argv[4])
MARGIN = 0.03  # fração de margem ao redor do conteúdo

img = Image.open(SRC).convert("RGBA")

# Recorta pelo conteúdo (bbox do canal alpha).
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

inner_w = TARGET_W * (1 - 2 * MARGIN)
inner_h = TARGET_H * (1 - 2 * MARGIN)
scale = min(inner_w / img.width, inner_h / img.height)
new_w = max(1, round(img.width * scale))
new_h = max(1, round(img.height * scale))
resized = img.resize((new_w, new_h), Image.LANCZOS)

canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
canvas.paste(resized, ((TARGET_W - new_w) // 2, (TARGET_H - new_h) // 2), resized)
canvas.save(DST)
print("saved", DST, canvas.size)
