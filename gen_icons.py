from PIL import Image, ImageDraw
import math

BG = (22, 19, 17, 255)       # --bg
AMBER = (226, 162, 92, 255)  # --amber
AMBER2 = (240, 189, 130, 255) # --amber2
SAGE = (157, 184, 154, 255)  # --sage

def draw_icon(size, pad_ratio, filename, bg=True):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    if bg:
        d.rounded_rectangle([0,0,size,size], radius=size*0.22, fill=BG)

    cx, cy = size/2, size/2
    eye_w = size * (1 - pad_ratio*2)
    eye_h = eye_w * 0.55

    # eye almond shape via two arcs (bezier-ish using polygon approx)
    left = cx - eye_w/2
    right = cx + eye_w/2
    top = cy - eye_h/2
    bot = cy + eye_h/2

    steps = 60
    pts_top = []
    pts_bot = []
    for i in range(steps+1):
        t = i/steps
        x = left + t*(right-left)
        # sine curve for lids
        y_top = cy - (eye_h/2) * math.sin(t*math.pi)
        y_bot = cy + (eye_h/2) * math.sin(t*math.pi)
        pts_top.append((x,y_top))
        pts_bot.append((x,y_bot))
    poly = pts_top + pts_bot[::-1]
    d.polygon(poly, fill=AMBER2)

    # iris + pupil
    iris_r = eye_h*0.62
    d.ellipse([cx-iris_r, cy-iris_r, cx+iris_r, cy+iris_r], fill=SAGE)
    pupil_r = iris_r*0.42
    d.ellipse([cx-pupil_r, cy-pupil_r, cx+pupil_r, cy+pupil_r], fill=BG)

    img.save(filename)

draw_icon(192, 0.16, "icon-192.png")
draw_icon(512, 0.16, "icon-512.png")
draw_icon(512, 0.24, "icon-512-maskable.png")  # more padding for safe-zone
print("done")
