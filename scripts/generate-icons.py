#!/usr/bin/env python3
"""
Generate crisp, high-resolution brand icons and favicon for WDIII Tech Vault.
Outputs:
  - public/icon-512.png (512x512)
  - public/icon-192.png (192x192)
  - public/icon.png     (512x512)
  - public/apple-touch-icon.png (180x180)
  - public/favicon-32x32.png (32x32)
  - public/favicon.ico (32x32 embedded PNG)
"""

import zlib
import struct
import math
import os

def point_in_poly(x, y, poly):
    inside = False
    n = len(poly)
    p1x, p1y = poly[0]
    for i in range(1, n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# Normalized geometry (0.0 to 1.0)
SHIELD_POLY = [
    (0.50, 0.12),
    (0.83, 0.20),
    (0.83, 0.50),
    (0.50, 0.88),
    (0.17, 0.50),
    (0.17, 0.20)
]

W_POLY = [
    (0.30, 0.31),
    (0.36, 0.29),
    (0.45, 0.53),
    (0.50, 0.32),
    (0.55, 0.53),
    (0.64, 0.29),
    (0.70, 0.31),
    (0.59, 0.75),
    (0.50, 0.50),
    (0.41, 0.75)
]

DOT_CX, DOT_CY, DOT_R = 0.50, 0.245, 0.034

# Brand Colors (RGB)
BG_COLOR = (10, 13, 20)      # #0a0d14
SHIELD_COLOR = (216, 220, 226) # #d8dce2
W_COLOR = (15, 23, 42)        # #0f172a
DOT_COLOR = (37, 99, 235)     # #2563eb

def render_image(width, height):
    # 2x2 sub-sampling for clean anti-aliasing
    sub = 2
    sub_w = width * sub
    sub_h = height * sub
    
    # Pre-render grid
    pixels = bytearray(width * height * 4)
    dot_r_sq = DOT_R * DOT_R
    
    for y in range(height):
        for x in range(width):
            r_acc, g_acc, b_acc, a_acc = 0, 0, 0, 0
            for sy in range(sub):
                ny = (y * sub + sy + 0.5) / sub_h
                for sx in range(sub):
                    nx = (x * sub + sx + 0.5) / sub_w
                    
                    # Check inside W
                    if point_in_poly(nx, ny, W_POLY):
                        r_acc += W_COLOR[0]
                        g_acc += W_COLOR[1]
                        b_acc += W_COLOR[2]
                        a_acc += 255
                    # Check inside Dot
                    elif (nx - DOT_CX)**2 + (ny - DOT_CY)**2 <= dot_r_sq:
                        r_acc += DOT_COLOR[0]
                        g_acc += DOT_COLOR[1]
                        b_acc += DOT_COLOR[2]
                        a_acc += 255
                    # Check inside Shield
                    elif point_in_poly(nx, ny, SHIELD_POLY):
                        r_acc += SHIELD_COLOR[0]
                        g_acc += SHIELD_COLOR[1]
                        b_acc += SHIELD_COLOR[2]
                        a_acc += 255
                    # Background
                    else:
                        r_acc += BG_COLOR[0]
                        g_acc += BG_COLOR[1]
                        b_acc += BG_COLOR[2]
                        a_acc += 255
            
            samples = sub * sub
            idx = (y * width + x) * 4
            pixels[idx] = r_acc // samples
            pixels[idx + 1] = g_acc // samples
            pixels[idx + 2] = b_acc // samples
            pixels[idx + 3] = a_acc // samples
            
    return bytes(pixels)

def encode_png(width, height, rgba_data):
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter: None
        raw.extend(rgba_data[y * width * 4 : (y + 1) * width * 4])
    compressed = zlib.compress(bytes(raw), level=9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    # IHDR
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr)))
    # IDAT
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed)))
    # IEND
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND')))
    return bytes(png)

def create_ico(png_data, width=32, height=32):
    # Standard ICO containing a single PNG image
    header = struct.pack('<HHH', 0, 1, 1)  # reserved, type (1=ico), count (1)
    entry = struct.pack(
        '<BBBBHHII',
        width if width < 256 else 0,
        height if height < 256 else 0,
        0,  # colors
        0,  # reserved
        1,  # planes
        32, # bpp
        len(png_data),
        6 + 16 # offset
    )
    return header + entry + png_data

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root, 'public')
    
    configs = [
        ('icon-512.png', 512, 512),
        ('icon-192.png', 192, 192),
        ('icon.png', 512, 512),
        ('apple-touch-icon.png', 180, 180),
        ('favicon-32x32.png', 32, 32),
    ]
    
    png_32 = None
    for name, w, h in configs:
        print(f'Rendering {name} ({w}x{h})...')
        pixels = render_image(w, h)
        png = encode_png(w, h, pixels)
        path = os.path.join(public_dir, name)
        with open(path, 'wb') as f:
            f.write(png)
        print(f'  Saved {path} ({len(png)} bytes)')
        if w == 32 and h == 32:
            png_32 = png
            
    if png_32:
        ico = create_ico(png_32, 32, 32)
        ico_path = os.path.join(public_dir, 'favicon.ico')
        with open(ico_path, 'wb') as f:
            f.write(ico)
        print(f'  Saved {ico_path} ({len(ico)} bytes)')

if __name__ == '__main__':
    main()
