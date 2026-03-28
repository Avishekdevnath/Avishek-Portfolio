from PIL import Image
import os

src = "public/assets/home/profile-img.jpg"
os.makedirs("public/icons", exist_ok=True)

sizes = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "icon-512-maskable.png": 512,
    "icon-180.png": 180,
}

img = Image.open(src).convert("RGBA")

for filename, size in sizes.items():
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(f"public/icons/{filename}", "PNG")
    print(f"Generated public/icons/{filename}")
