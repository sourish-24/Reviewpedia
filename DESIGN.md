# Reviewpedia Design Guidelines (Novify Dark Theme)

## 1. Overview & Creative North Star
The Creative North Star for this design system is the **"Novify"** aesthetic. 
This system embraces a deep, premium dark theme. We reject generic SaaS templates in favor of a sleek, glassmorphic, high-contrast dark mode that feels "iconic, minimal, and premium."

## 2. Color Palette: The Standard Indigo
Colors are highly standardized across all components to ensure absolute consistency. 

- **Background / Surface**: `#030303` (Deep space black - used as the primary background everywhere)
- **Standard Primary Indigo**: `#5138d6` (`rgb(81, 56, 214)`). This is the definitive "Brand Color". It is used for all active icons, text highlights, map marker dots, hexagons, and profile avatars. It is a deep, elegant indigo that is not too bright.
- **Primary Dark (Buttons/Containers)**: `#34208a` (A very dark indigo used specifically for button backgrounds and deep containers to avoid overwhelming brightness).
- **Primary Hover**: `#36238c` (Slightly lighter indigo for button hover states).
- **Text (Primary)**: `#ffffff` (Pure white for high contrast).
- **Text (Secondary)**: `#a1a1aa` (Cool gray for descriptions and inactive states).
- **Borders / Dividers**: `rgba(255, 255, 255, 0.1)` or `0.05` for subtle structural lines.

## 3. UI Components & Elements
- **Buttons**: Must use the Primary Dark (`#2b1b70`) background with a subtle white border `rgba(110, 86, 245, 0.3)`. No blurry box-shadows or "weird glows". Sharp border-radius (8px) for forms or fully rounded (9999px) for pill buttons depending on context.
- **Glass Panels**: `rgba(10, 10, 10, 0.7)` with `backdrop-filter: blur(20px)`. Used for all overlay panels on the map, agent boxes, and chat windows.
- **Header**: Transparent dark `rgba(3, 3, 3, 0.6)` with 12px blur. Dropdown menus must seamlessly attach to the bottom with matching styling.
- **Horizon Glow**: A massive background radial gradient at the top of the landing page, using `rgba(81, 56, 214)` (Standard Primary) fading into transparency to create an atmospheric, curved horizon effect.

## 4. Map Elements
- **Hexagons (Market Research)**: Must use the Standard Primary Indigo (`#5138d6` / `rgba(81, 56, 214)`) with dynamic opacity based on density.
- **Review Pins (Browse Reviews)**: Must use the Standard Primary Indigo (`var(--primary)`).
- **User Location Dot**: Must use the Standard Primary Indigo.

Always refer to these standard colors to maintain consistency. Do not introduce new shades of blue, pink, or purple without consulting this document. Every element (buttons, avatars, map markers, icons) must pull from this central indigo palette.