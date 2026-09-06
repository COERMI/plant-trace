"""
生成「植迹」PWA 图标：苔绿色背景 + 白色极简叶子图形
方案：上半叶用 t∈[0,π] 沿长轴方向走 + 宽度为 r(t) 的正弦类曲线
"""
import math
from PIL import Image, ImageDraw

PRIMARY = (74, 124, 89)
WHITE = (255, 255, 255)
LIGHT = (232, 240, 235)


def leaf_polygon(cx, cy, length, width, angle_deg, samples=40):
    """
    构造一个叶形多边形：
    沿长轴从 -length/2 到 +length/2，每个位置上的半宽为：
    r(x) = width * sin(pi * (x+length/2)/length) ** 0.8
    """
    pts = []
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    half = length / 2
    # 上半（中心到上侧）：x 从 -half 到 +half
    for i in range(samples + 1):
        t = i / samples
        lx = -half + length * t  # -half..+half
        # 形状权重：t∈[0,1], sin(pi*t) 在两端为0中间为1, 0.8 次幂让叶形更尖
        r = math.sin(math.pi * t) ** 0.85
        ny = r * width / 2
        x = lx * cos_a - ny * sin_a + cx
        y = lx * sin_a + ny * cos_a + cy
        pts.append((int(x), int(y)))
    # 下半（反向，从 +half 到 -half）
    for i in range(samples, -1, -1):
        t = i / samples
        lx = -half + length * t
        r = math.sin(math.pi * t) ** 0.85
        ny = -r * width / 2
        x = lx * cos_a - ny * sin_a + cx
        y = lx * sin_a + ny * cos_a + cy
        pts.append((int(x), int(y)))
    return pts


def stem_polygon(top, bot, thickness):
    x1, y1 = top
    x2, y2 = bot
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    if L == 0:
        return None
    nx, ny = -dy / L, dx / L
    half = thickness / 2
    p1 = (x1 + nx * half, y1 + ny * half)
    p2 = (x2 + nx * half, y2 + ny * half)
    p3 = (x2 - nx * half, y2 - ny * half)
    p4 = (x1 - nx * half, y1 - ny * half)
    return [(int(p[0]), int(p[1])) for p in [p1, p2, p3, p4]]


def draw_leaf(draw, cx, cy, size):
    # 主叶：右上方倾斜
    main_len = size * 1.10
    main_wid = size * 0.36
    main_pts = leaf_polygon(cx + size * 0.10, cy - size * 0.08, main_len, main_wid, -32)
    draw.polygon(main_pts, fill=WHITE)

    # 次叶：左下方，与主叶重叠一部分，更明显
    sub_len = size * 0.85
    sub_wid = size * 0.30
    sub_pts = leaf_polygon(cx - size * 0.12, cy + size * 0.10, sub_len, sub_wid, -32)
    draw.polygon(sub_pts, fill=WHITE)

    # 茎：连接底部
    stem_top = (cx - size * 0.04, cy + size * 0.48)
    stem_bot = (cx - size * 0.30, cy + size * 0.58)
    stem = stem_polygon(stem_top, stem_bot, size * 0.025)
    if stem:
        draw.polygon(stem, fill=WHITE)

    # 主叶叶脉
    vein_rad = math.radians(-32)
    leaf_cx, leaf_cy = cx + size * 0.10, cy - size * 0.08
    vlen = main_len * 0.6
    dx = math.cos(vein_rad) * vlen / 2
    dy = math.sin(vein_rad) * vlen / 2
    draw.line(
        [(leaf_cx - dx, leaf_cy - dy), (leaf_cx + dx, leaf_cy + dy)],
        fill=LIGHT,
        width=max(1, int(size * 0.025)),
    )

    # 次叶叶脉
    sub_cx, sub_cy = cx - size * 0.12, cy + size * 0.10
    svlen = sub_len * 0.55
    sdx = math.cos(vein_rad) * svlen / 2
    sdy = math.sin(vein_rad) * svlen / 2
    draw.line(
        [(sub_cx - sdx, sub_cy - sdy), (sub_cx + sdx, sub_cy + sdy)],
        fill=LIGHT,
        width=max(1, int(size * 0.022)),
    )


def make_icon(size):
    img = Image.new("RGB", (size, size), PRIMARY)
    draw = ImageDraw.Draw(img)
    draw_leaf(draw, size / 2, size / 2, size * 0.62)
    return img


if __name__ == "__main__":
    import os
    out_dir = os.path.join(os.path.dirname(__file__), "..", "public")
    os.makedirs(out_dir, exist_ok=True)
    make_icon(192).save(os.path.join(out_dir, "pwa-192x192.png"))
    make_icon(512).save(os.path.join(out_dir, "pwa-512x512.png"))
    make_icon(180).save(os.path.join(out_dir, "apple-touch-icon.png"))
    fav = make_icon(32)
    fav.save(os.path.join(out_dir, "favicon-32x32.png"))
    fav.save(os.path.join(out_dir, "favicon.ico"), sizes=[(16, 16), (32, 32)])
    print("icons generated:", os.listdir(out_dir))
