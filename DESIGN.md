# Design System Documentation: The Editorial Cartographer

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Editorial Cartographer."** 

This system rejects the "template" aesthetic of generic SaaS platforms. Instead, it draws inspiration from high-end Swiss typography and modern cartographic maps—blending technical precision with premium editorial flair. We achieve an "iconic yet simple" look by leaning into extreme contrast: stark black typography set against a pristine white canvas, punctuated by a singular, authoritative violet. 

We break the grid through intentional asymmetry. Elements are not merely placed; they are "surveyed." Expect generous white space (the "tundra"), overlapping layers that suggest depth without clutter, and a typographic hierarchy that feels like a map legend—clear, functional, and beautiful.

---

## 2. Colors: High-Contrast Precision
The palette is built on the tension between the depth of the violet and the clarity of the neutral scale.

- **Primary (`#6e00c1`):** Use this sparingly as a "Signal" color. It represents action, discovery, and pathfinding. 
- **Typography & Surface-On:** Per the mandate for high readability, all text must utilize `on_surface` (`#1a1c1c`) or true black. High contrast is the primary driver of the premium feel.
- **The "No-Line" Rule:** Designers are strictly prohibited from using 1px solid borders to define sections. Boundaries must be defined through background color shifts. For example, a `surface_container_low` (`#f3f3f4`) block sitting on a `surface` (`#ffffff`) background provides all the definition needed without the "cheapness" of a stroke.
- **The "Glass & Gradient" Rule:** To move beyond a flat UI, main CTAs and hero elements should utilize a subtle gradient from `primary` (`#6e00c1`) to `primary_container` (`#8a2be2`). For floating overlays on top of the Map, use `surface_container_lowest` (#ffffff) at 95% opacity to avoid washing out into the white cartography, supported by a heavy `0 16px 40px rgba(0,0,0,0.15)` drop shadow.

---

## 3. Typography: The Monolith Scale
Typography is the architecture of this system. We use two specific families to convey technical authority.

- **Display & Headlines (Space Grotesk):** This is our "Cartographic" font. Its geometric, slightly technical terminals give the system its modern edge. Use `display-lg` (3.5rem) with tight letter-spacing for a "Monolith" effect.
- **Body & Labels (Inter):** The workhorse. Chosen for its neutral, high-legibility profile. It ensures that even at `label-sm` (0.6875rem), the data remains functional.
- **Visual Identity:** Always prioritize `on_surface` (`#1a1c1c`) for headlines. The interaction of heavy, dark Space Grotesk against a clean `surface` creates an immediate sense of premium quality.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely replaced by **Tonal Layering**. We create depth by stacking surfaces of varying "temperatures."

- **The Layering Principle:** 
    1. Base: `surface` (`#f9f9f9`)
    2. Sectioning: `surface_container_low` (`#f3f3f4`)
    3. Prominence: `surface_container_lowest` (`#ffffff`) - This creates a "lift" that feels like a sheet of fine paper resting on a desk.
- **Ambient Shadows:** If a component must float (e.g., a modal), use a shadow with a `40px` blur and `4%` opacity using a tint of `primary` (`#6e00c1`). This creates an atmospheric glow rather than a muddy grey shadow.
- **The "Ghost Border":** If a border is required for accessibility, use the `outline_variant` (`#cfc2d7`) at 15% opacity. It should be felt, not seen.

---

## 5. Components: The Primitive Set

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. Text is `on_primary` (White). Use `md` (0.375rem) roundedness for a modern, architectural feel.
- **Tertiary:** No background, no border. Use `primary` bold text with a small `0.5` spacing underline that expands on hover.

### Stars & Ratings (The Golden Rule)
- Product ratings must **never** be monochromatic violet. Always use Golden (`#eab308`) for filled active stars, and Dark Grey (`#94a3b8`) for empty stars to provide instantaneous visual clarity without cognitive load.

### Chips (Data Points)
- Used for filtering and status. 
- **Style:** Pill-shaped (`full` roundedness). Background: `surface_container_high`. Text: `on_surface_variant`. On selection, transition to `primary` with `on_primary` text.

### Cards & Lists
- **Forbid Dividers:** Do not use lines to separate list items. Use vertical white space from the Spacing Scale (e.g., `spacing-4` or `1.4rem`) or subtle alternating background shifts.
- **Asymmetric Layouts:** In cards, align titles to the top-left and secondary data (like coordinates or timestamps) to the bottom-right to mimic a map layout.

### Input Fields
- **Style:** Form inputs must stand out from the white `#ffffff` modal backgrounds. Use a heavily contrasted `surface_highest` (`#e2e8f0` Slate) block. 
- **Focus State:** A `2px` solid `primary` bottom border gracefully appears. No "glow" or outer rings.

### The "Legend" Tooltip
- Tooltips should use `inverse_surface` (Dark) with `inverse_on_surface` (Light) text. This provides a sharp, high-contrast pop-out effect against the white background.

---

## 6. Do's and Don'ts

### Do:
- **Embrace the "White Tundra":** Use the `20` (7rem) and `24` (8.5rem) spacing tokens to separate major sections. White space is a luxury.
- **Use Intentional Overlaps:** Allow imagery (like the violet vehicles or maps) to slightly break the container bounds of a card to create 3D interest.
- **Tighten Line-Height:** For `display` and `headline` styles, keep line-height tight (approx 1.1) to maintain the "editorial" weight.

### Don't:
- **No Gray Text:** Avoid using medium grays for body text. If it's not `primary` violet, it should be `on_surface` (#1a1c1c) for maximum "iconic" contrast.
- **No Rounding Overload:** Do not use `full` rounding on cards or containers. Stick to `sm` or `md`. Reserve `full` rounding strictly for Chips and Buttons to distinguish "interactive" vs "structural" elements.
- **No 1px Lines:** If you feel the urge to draw a line, use a background color shift instead.

---

## 7. Cartographic Inspiration Note
When designing layouts, think of the "Information Density" of a map. Use `label-sm` and `label-md` for technical metadata (lat/long, timestamps, ID numbers) and place them in the margins. This frames the content and reinforces the "Atlas" heritage of the design system without needing to use the name.