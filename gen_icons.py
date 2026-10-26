"""Generates Bloom's app icons: a six-petal bloom, alternating each program's accent colour."""
from PIL import Image, ImageDraw
import math

BG = (22, 19, 17, 255)
AMBER = (240, 189, 130, 255)
TEAL = (166, 211, 203, 255)
CENTER = (236, 227, 212, 255)

def draw_icon(size, pad_ratio, filename):
    scale = 4  # supersample for smooth edges
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s, s], radius=s * 0.22, fill=BG)

    cx = cy = s / 2
    radius = s * (0.5 - pad_ratio)
    petal_len = radius * 0.62
    petal_w = radius * 0.30
    for i in range(6):
        ang = math.radians(i * 60 - 90)
        px = cx + math.cos(ang) * petal_len * 0.78
        py = cy + math.sin(ang) * petal_len * 0.78
        petal = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        pd = ImageDraw.Draw(petal)
        pd.ellipse([px - petal_w, py - petal_len * 0.55, px + petal_w, py + petal_len * 0.55],
                   fill=AMBER if i % 2 == 0 else TEAL)
        petal = petal.rotate(-(i * 60), center=(px, py), resample=Image.BICUBIC)
        img.alpha_composite(petal)

    cr = radius * 0.2
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=CENTER)
    img.resize((size, size), Image.LANCZOS).save(filename)

draw_icon(192, 0.14, "icon-192.png")
draw_icon(512, 0.14, "icon-512.png")
draw_icon(512, 0.24, "icon-512-maskable.png")
print("done")
