# Resources

This directory contains app icons for different platforms:

- `icon.icns` - macOS icon (512x512)
- `icon.ico` - Windows icon (256x256) 
- `icon.png` - Linux icon (512x512)

## Creating Icons

You can create these icons from a 1024x1024 PNG source image using:

### macOS (.icns)
```bash
# Using iconutil (built into macOS)
mkdir icon.iconset
sips -z 16 16   icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32   icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32   icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64   icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```

### Windows (.ico)
Use online converters or tools like ImageMagick:
```bash
convert icon.png -resize 256x256 icon.ico
```

### Linux (.png)
```bash
cp icon.png resources/icon.png
```