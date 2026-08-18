from collections import deque
from pathlib import Path
from PIL import Image

src = Path('/home/ubuntu/lol-meme-wiki/public/logo-concept-2.png')
out = Path('/home/ubuntu/lol-meme-wiki/public/lol-meme-wiki-logo.png')
icon = Path('/home/ubuntu/lol-meme-wiki/public/lol-meme-wiki-mark.png')

image = Image.open(src).convert('RGBA')
pixels = image.load()
w, h = image.size
background = pixels[0, 0][:3]
visited = bytearray(w * h)
queue = deque()
for x in range(w):
    queue.append((x, 0))
    queue.append((x, h - 1))
for y in range(1, h - 1):
    queue.append((0, y))
    queue.append((w - 1, y))

def close_to_background(rgb):
    return max(abs(rgb[i] - background[i]) for i in range(3)) < 100

while queue:
    x, y = queue.popleft()
    idx = y * w + x
    if visited[idx]:
        continue
    visited[idx] = 1
    r, g, b, a = pixels[x, y]
    if not close_to_background((r, g, b)):
        continue
    pixels[x, y] = (r, g, b, 0)
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h:
            nidx = ny * w + nx
            if not visited[nidx]:
                queue.append((nx, ny))

bbox = image.getbbox()
if bbox:
    image = image.crop(bbox)
    pad = max(48, int(min(image.size) * 0.08))
    canvas = Image.new('RGBA', (image.width + pad * 2, image.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(image, (pad, pad))
    image = canvas

image.save(out, optimize=True)
image.resize((512, 512), Image.Resampling.LANCZOS).save(icon, optimize=True)
print(out)
print(icon)
print(image.size)
