"""
Processes user uploaded Google Pay icon into all required Android adaptive icon assets
and mipmaps.
"""

import os
from PIL import Image, ImageDraw
import numpy as np

UPLOADED_IMAGE_PATH = r"C:\Users\KAVIRAJ\.gemini\antigravity\brain\88df5645-733d-4f05-9a91-e4ea522ad4c1\.user_uploaded\media_1795160972473_e11ed5f1.png"
PROJECT_ROOT = r"C:\Users\KAVIRAJ\Desktop\PROJECT\fake gpay"

def main():
    print(f"Reading uploaded image from {UPLOADED_IMAGE_PATH}...")
    im = Image.open(UPLOADED_IMAGE_PATH).convert('RGBA')

    # The emblem is located between (26, 38) and (198, 186)
    crop = im.crop((26, 38, 198, 186))
    arr = np.array(crop, dtype=np.float32)
    rgb = arr[:, :, :3]

    # Calculate distance from pure white (255, 255, 255)
    dist_from_white = 255.0 - np.min(rgb, axis=2)

    # Smooth anti-aliasing curve
    alpha = np.clip((dist_from_white - 8.0) / 36.0, 0.0, 1.0)

    # Un-premultiply colors so edges don't have halos
    color = np.copy(rgb)
    mask = (alpha > 0.01) & (alpha < 0.99)
    for c in range(3):
        color[mask, c] = np.clip((rgb[mask, c] - 255.0 * (1.0 - alpha[mask])) / alpha[mask], 0, 255)

    rgba = np.zeros((crop.height, crop.width, 4), dtype=np.uint8)
    rgba[:, :, :3] = color.astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255.0).astype(np.uint8)

    emblem_isolated = Image.fromarray(rgba, 'RGBA')

    # 1. Generate Adaptive Foreground (1024x1024)
    # Target emblem size: 520px wide (fits comfortably within the 66% safe zone of 675px)
    fg_1024 = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    target_w = 520
    target_h = int(emblem_isolated.height * (target_w / emblem_isolated.width))
    emblem_fg = emblem_isolated.resize((target_w, target_h), Image.Resampling.LANCZOS)
    paste_x = (1024 - target_w) // 2
    paste_y = (1024 - target_h) // 2
    fg_1024.paste(emblem_fg, (paste_x, paste_y), emblem_fg)

    # 2. Generate Adaptive Background (1024x1024, clean white #FFFFFF)
    bg_1024 = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))

    # 3. Generate icon.png (1024x1024, white background with centered emblem)
    icon_1024 = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
    # For standalone icon, make emblem slightly larger (~620px) for high visibility
    icon_w = 620
    icon_h = int(emblem_isolated.height * (icon_w / emblem_isolated.width))
    emblem_icon = emblem_isolated.resize((icon_w, icon_h), Image.Resampling.LANCZOS)
    ix = (1024 - icon_w) // 2
    iy = (1024 - icon_h) // 2
    icon_1024.paste(emblem_icon, (ix, iy), emblem_icon)

    # 4. Generate splash-icon.png (512x512)
    splash_512 = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    splash_w = 320
    splash_h = int(emblem_isolated.height * (splash_w / emblem_isolated.width))
    emblem_splash = emblem_isolated.resize((splash_w, splash_h), Image.Resampling.LANCZOS)
    sx = (512 - splash_w) // 2
    sy = (512 - splash_h) // 2
    splash_512.paste(emblem_splash, (sx, sy), emblem_splash)

    # Save to assets/images
    assets_dir = os.path.join(PROJECT_ROOT, "assets", "images")
    os.makedirs(assets_dir, exist_ok=True)

    fg_path = os.path.join(assets_dir, "android-icon-foreground.png")
    bg_path = os.path.join(assets_dir, "android-icon-background.png")
    icon_path = os.path.join(assets_dir, "icon.png")
    splash_path = os.path.join(assets_dir, "splash-icon.png")

    fg_1024.save(fg_path, "PNG")
    bg_1024.save(bg_path, "PNG")
    icon_1024.save(icon_path, "PNG")
    splash_512.save(splash_path, "PNG")
    print("Saved icon assets in assets/images/")

    # 5. Generate Android Native Mipmaps
    densities = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432),
    }

    res_dir = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

    for folder, (launcher_sz, adapt_sz) in densities.items():
        dir_path = os.path.join(res_dir, folder)
        os.makedirs(dir_path, exist_ok=True)

        # A) ic_launcher.webp (Legacy square/squircle icon)
        launcher_img = icon_1024.resize((launcher_sz, launcher_sz), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(dir_path, 'ic_launcher.webp'), 'WEBP', quality=100)

        # B) ic_launcher_round.webp (Circular mask)
        mask = Image.new('L', (launcher_sz, launcher_sz), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, launcher_sz, launcher_sz], fill=255)
        round_img = Image.new('RGBA', (launcher_sz, launcher_sz), (0, 0, 0, 0))
        round_img.paste(launcher_img, (0, 0), mask)
        round_img.save(os.path.join(dir_path, 'ic_launcher_round.webp'), 'WEBP', quality=100)

        # C) ic_launcher_foreground.webp (Adaptive foreground)
        adapt_fg = fg_1024.resize((adapt_sz, adapt_sz), Image.Resampling.LANCZOS)
        adapt_fg.save(os.path.join(dir_path, 'ic_launcher_foreground.webp'), 'WEBP', quality=100)

        # D) ic_launcher_background.webp (Adaptive white background)
        adapt_bg = bg_1024.resize((adapt_sz, adapt_sz), Image.Resampling.LANCZOS)
        adapt_bg.save(os.path.join(dir_path, 'ic_launcher_background.webp'), 'WEBP', quality=100)

        # E) ic_launcher_monochrome.webp
        adapt_fg.save(os.path.join(dir_path, 'ic_launcher_monochrome.webp'), 'WEBP', quality=100)

    print("All Android native mipmap layers generated successfully!")

if __name__ == "__main__":
    main()
