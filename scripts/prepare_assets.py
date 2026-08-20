"""Prepare supplied branding and vetted documentary assets for the MUSUBI site.

Run with:
    .venv-assets/bin/python scripts/prepare_assets.py

Original downloads live in the ignored .asset-source directory. The script strips
metadata, avoids enlarging source material, and writes deployment-ready files to
public/assets. Artwork receives resizing only; documentary photos get restrained
editorial crops and tonal balancing.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".asset-source"
BRAND = ROOT / "public" / "assets" / "brand"
IMAGES = ROOT / "public" / "assets" / "images"
SOCIAL = ROOT / "public" / "assets" / "social"


def open_verified(name: str) -> Image.Image:
    path = SOURCE / name
    with Image.open(path) as probe:
        probe.verify()
    with Image.open(path) as source:
        return ImageOps.exif_transpose(source).convert("RGB")


def contain(image: Image.Image, maximum: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(maximum, Image.Resampling.LANCZOS, reducing_gap=3.0)
    return copy


def save_webp(image: Image.Image, destination: Path, quality: int = 84) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=quality, method=6, exact=True)


def fit_without_upscale(
    image: Image.Image,
    size: tuple[int, int],
    centering: tuple[float, float] = (0.5, 0.5),
) -> Image.Image:
    target_width = min(size[0], image.width)
    target_height = min(size[1], image.height)
    target_ratio = target_width / target_height
    source_ratio = image.width / image.height

    if source_ratio > target_ratio:
        crop_width = round(image.height * target_ratio)
        available = image.width - crop_width
        left = round(available * centering[0])
        box = (left, 0, left + crop_width, image.height)
    else:
        crop_height = round(image.width / target_ratio)
        available = image.height - crop_height
        top = round(available * centering[1])
        box = (0, top, image.width, top + crop_height)

    return image.crop(box).resize(
        (target_width, target_height), Image.Resampling.LANCZOS, reducing_gap=3.0
    )


def editorial_photo(
    source_name: str,
    destination_name: str,
    size: tuple[int, int],
    centering: tuple[float, float],
    *,
    saturation: float = 0.84,
    contrast: float = 1.04,
    brightness: float = 0.94,
) -> None:
    image = fit_without_upscale(open_verified(source_name), size, centering)
    image = ImageEnhance.Color(image).enhance(saturation)
    image = ImageEnhance.Contrast(image).enhance(contrast)
    image = ImageEnhance.Brightness(image).enhance(brightness)
    save_webp(image, IMAGES / destination_name)


def transparent_gold(source_name: str, destination_name: str, maximum: tuple[int, int]) -> None:
    image = open_verified(source_name)
    sample_points = [
        (0, 0),
        (image.width - 1, 0),
        (0, image.height - 1),
        (image.width - 1, image.height - 1),
    ]
    background = tuple(
        sum(image.getpixel(point)[channel] for point in sample_points) / len(sample_points)
        for channel in range(3)
    )

    rgba = image.convert("RGBA")
    source_pixels = list(rgba.get_flattened_data())
    alpha_values = []
    for red, green, blue, _ in source_pixels:
        brightest = max(red, green, blue)
        darkest = min(red, green, blue)
        saturation = (brightest - darkest) / brightest if brightest else 0.0
        warm_bias = max(0.0, (red - blue) / 255)
        score = saturation * 0.86 + warm_bias * 0.14
        alpha = round(max(0.0, min(1.0, (score - 0.035) / 0.16)) * 255)
        alpha_values.append(alpha)

    mask = Image.new("L", image.size)
    mask.putdata(alpha_values)
    mask = mask.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.45))

    # Remove the pale JPEG matte from antialiased edges so the marks sit cleanly
    # on the proposal's dark background without a white fringe.
    output_pixels = []
    for (red, green, blue, _), alpha_byte in zip(
        source_pixels, mask.get_flattened_data(), strict=True
    ):
        if alpha_byte <= 3:
            output_pixels.append((red, green, blue, 0))
            continue
        alpha = alpha_byte / 255
        unmatted = tuple(
            round(max(0, min(255, (channel - (1 - alpha) * matte) / alpha)))
            for channel, matte in zip((red, green, blue), background, strict=True)
        )
        output_pixels.append((*unmatted, alpha_byte))
    rgba.putdata(output_pixels)

    bounds = rgba.getbbox()
    if bounds:
        padding = max(12, round(min(image.size) * 0.015))
        left = max(0, bounds[0] - padding)
        top = max(0, bounds[1] - padding)
        right = min(image.width, bounds[2] + padding)
        bottom = min(image.height, bounds[3] + padding)
        rgba = rgba.crop((left, top, right, bottom))

    rgba.thumbnail(maximum, Image.Resampling.LANCZOS, reducing_gap=3.0)
    destination = BRAND / destination_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(destination, "PNG", optimize=True)


def transparent_logo(source_name: str, destination_name: str, maximum: tuple[int, int]) -> None:
    path = SOURCE / source_name
    with Image.open(path) as probe:
        probe.verify()
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGBA")
    bounds = image.getbbox()
    if bounds:
        image = image.crop(bounds)
    image.thumbnail(maximum, Image.Resampling.LANCZOS, reducing_gap=3.0)
    destination = BRAND / destination_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "PNG", optimize=True)


def build_social_card() -> None:
    """Compose the social card deterministically from exact, approved source assets."""
    SOCIAL.mkdir(parents=True, exist_ok=True)
    card = Image.new("RGB", (1200, 630), "#0f0d0b")

    texture = fit_without_upscale(open_verified("soami.jpg"), (1200, 630), (0.5, 0.45))
    texture = ImageEnhance.Contrast(texture).enhance(0.72)
    texture = ImageEnhance.Color(texture).enhance(0.35)
    texture.putalpha(42)
    card = Image.alpha_composite(card.convert("RGBA"), texture.convert("RGBA"))

    art = contain(open_verified("zeshin.jpg"), (370, 520))
    art_x = 1200 - art.width - 54
    art_y = (630 - art.height) // 2
    card.alpha_composite(art.convert("RGBA"), (art_x, art_y))

    wordmark = Image.open(BRAND / "musubi-horizontal.png").convert("RGBA")
    wordmark.thumbnail((660, 270), Image.Resampling.LANCZOS, reducing_gap=3.0)
    card.alpha_composite(wordmark, (54, 175))

    year = Image.open(BRAND / "musubi-26.png").convert("RGBA")
    year.thumbnail((220, 130), Image.Resampling.LANCZOS, reducing_gap=3.0)
    card.alpha_composite(year, (54, 430))

    logo = Image.open(BRAND / "club-logo-light.png").convert("RGBA")
    logo.thumbnail((72, 72), Image.Resampling.LANCZOS, reducing_gap=3.0)
    card.alpha_composite(logo, (54, 45))

    draw = ImageDraw.Draw(card)
    gold = (208, 170, 115, 180)
    draw.rectangle((24, 24, 1175, 605), outline=gold, width=2)
    draw.line((770, 24, 770, 606), fill=gold, width=1)
    card.convert("RGB").save(SOCIAL / "musubi-social.png", "PNG", optimize=True)


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)

    transparent_gold("musubi-horizontal.jpg", "musubi-horizontal.png", (1500, 700))
    transparent_gold("musubi-vertical.jpg", "musubi-vertical.png", (800, 1500))
    transparent_gold("musubi-26.jpg", "musubi-26.png", (900, 700))
    transparent_logo("club-logo-light.png", "club-logo-light.png", (1000, 1000))
    transparent_logo("club-logo-dark.png", "club-logo-dark.png", (1000, 1000))

    # Public-domain artworks: resize only, preserving the original compositions.
    save_webp(contain(open_verified("zeshin.jpg"), (1400, 1800)), IMAGES / "zeshin-sun-plum.webp", 88)
    save_webp(contain(open_verified("soami.jpg"), (2000, 1500)), IMAGES / "soami-landscape.webp", 86)
    save_webp(contain(open_verified("rough-waves.jpg"), (1800, 1800)), IMAGES / "rough-waves.webp", 88)
    save_webp(contain(open_verified("origata.jpg"), (1200, 1600)), IMAGES / "origata-tehon.webp", 88)
    save_webp(contain(open_verified("kiitsu.jpg"), (1900, 1000)), IMAGES / "kiitsu-plum-camellia.webp", 88)

    # Documentary photography: subtle crops and tone only; captions retain context.
    editorial_photo("school-entrance.jpg", "dssc-entrance.webp", (1600, 900), (0.5, 0.52), saturation=0.66, brightness=0.86)
    editorial_photo("tokyo-station.jpg", "tokyo-station-night.webp", (1800, 1125), (0.46, 0.68), saturation=0.78, brightness=0.86)
    editorial_photo("forum.jpg", "tokyo-forum.webp", (1000, 1400), (0.5, 0.30), saturation=0.55, brightness=0.86)
    editorial_photo("shinjuku-lanterns.jpg", "shinjuku-lanterns.webp", (1000, 1250), (0.82, 0.5), saturation=0.82, brightness=0.82)
    editorial_photo("friendship-concert.jpg", "friendship-concert.webp", (1600, 1000), (0.5, 0.43), saturation=0.74, brightness=0.89)
    build_social_card()

    for output in sorted([*BRAND.iterdir(), *IMAGES.iterdir(), *SOCIAL.iterdir()]):
        with Image.open(output) as image:
            print(f"{output.relative_to(ROOT)}\t{image.width}x{image.height}\t{output.stat().st_size} bytes")


if __name__ == "__main__":
    main()
