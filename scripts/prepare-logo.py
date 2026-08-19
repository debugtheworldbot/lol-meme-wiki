from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src = root / 'public' / 'lol-meme-wiki-logo.png'
icon = root / 'public' / 'lol-meme-wiki-mark.png'

image = Image.open(src).convert('RGB')
image.resize((512, 512), Image.Resampling.LANCZOS).save(icon, optimize=True)

print(src)
print(icon)
print(image.size)
