# Reviewpedia Design Guidelines (Windora Clean Sky Blue Theme)

## 1. Overview & Creative North Star
The Creative North Star for this design system is the **"Windora Clean Sky Blue"** aesthetic, inspired by modern eco-tech, clean energy, and high-contrast light design systems.
We have completely eliminated the previous dark indigo/black theme in favor of a crisp, airy, sky-blue, electric cyan, and clean slate aesthetic that feels fresh, high-tech, and deeply premium.

## 2. Color Palette: The Windora Sky Blue System
Colors are strictly standardized across all components and modes:

- **Primary Brand Cyan/Blue (`--primary`)**: `#0ea5e9` (Vibrant Electric Cyan) / `#0284c7` (Sky Blue). Used for primary buttons, active icons, interactive highlights, map pins, and density hexagons.
- **Primary Container / Dark (`--primary-container`)**: `#0369a1` (Deep Cyan) / `#0f172a` (Slate Navy).
- **Background (`--surface`)**: `#f0f7ff` (Soft Cloud Sky Tint / Light Blue-Gray).
- **Surface Lowest / Cards (`--surface-lowest`)**: `#ffffff` (Pure White cards with crisp borders and soft shadows).
- **Surface High (`--surface-high`)**: `#e0f2fe` (Ice Blue hover states and badge backgrounds).
- **Surface Highest (`--surface-highest`)**: `#bae6fd` (Soft Cyan selection accents).
- **Text (Primary)**: `#0f172a` (Deep Slate Charcoal for maximum legibility and contrast).
- **Text (Secondary)**: `#475569` (Muted Slate Gray for metadata and descriptions).
- **Footer Surface**: `#0f172a` (Dark Slate Navy footer block with white typography and cyan accents).
- **Borders / Dividers**: `rgba(2, 132, 199, 0.15)` or `#e2e8f0` for clean structural framing.

## 3. UI Components & Design Language
- **Hero & Landing Background**: `/windora_bg.jpg` (Abstract soft sky blue & cyan 3D waves background), giving an airy, open, futuristic environment.
- **Header**: Glassmorphic soft translucent white/light-blue background `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(16px)` and subtle sky-blue border.
- **Buttons**:
  - Primary (`.landing-btn-primary` / `.btn-primary`): Pill-shaped (`border-radius: 9999px`), gradient cyan `#0ea5e9` to `#0284c7`, white text, with optional arrow indicator icon.
  - Secondary/Outline (`.landing-btn-outline`): Pill-shaped, light sky-blue background `rgba(14, 165, 233, 0.08)` or white with `1px solid rgba(2, 132, 199, 0.3)` border and deep slate text.
- **Cards (`.landing-card` & Review Cards)**:
  - Pure white background (`#ffffff` / `#F8F4F0`).
  - Smooth rounded corners (`16px` to `24px` border radius).
  - Subtle drop shadow: `box-shadow: 0 10px 30px rgba(2, 132, 199, 0.08)`.
  - Hover state: Smooth lift (`translateY(-4px)`) with cyan glow border `rgba(14, 165, 233, 0.4)`.
- **Typography**:
  - Font Family: `Plus Jakarta Sans` / `Outfit` (`var(--font-body)` & `var(--font-display)`).
  - Headings: Slimmer, refined font weight (`500` / `600`), tight letter-spacing (`-0.035em`), deep slate color `#0f172a`.

## 4. Map & Visualization Elements
- **Density Hexagons (Market Research)**: Electric Cyan / Sky Blue (`#0ea5e9` / `#0284c7`) with dynamic density opacities.
- **Review Pins & Location Markers**: Sky Blue (`var(--primary)`).
- **User Location Indicator**: Vibrant Electric Cyan dot with pulsing outer sky-blue ring.

Always refer to these standard guidelines to maintain consistency across all new components and updates.