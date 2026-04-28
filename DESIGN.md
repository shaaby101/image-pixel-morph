---
name: Anarchic Dead-Drop
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#b9cbc1'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#83958c'
  outline-variant: '#3a4a43'
  surface-tint: '#00e1ab'
  primary: '#fbfffa'
  on-primary: '#003828'
  primary-container: '#00ffc2'
  on-primary-container: '#007255'
  inverse-primary: '#006c50'
  secondary: '#ffabf3'
  on-secondary: '#5b005b'
  secondary-container: '#fe00fe'
  on-secondary-container: '#500050'
  tertiary: '#fefdfd'
  on-tertiary: '#2f3131'
  tertiary-container: '#e1e1e1'
  on-tertiary-container: '#636464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#36ffc4'
  primary-fixed-dim: '#00e1ab'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513c'
  secondary-fixed: '#ffd7f5'
  secondary-fixed-dim: '#ffabf3'
  on-secondary-fixed: '#380038'
  on-secondary-fixed-variant: '#810081'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.05em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  graffiti-display:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.0'
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  window-padding: 2px
---

## Brand & Style

This design system is built on a foundation of digital rebellion and lo-fi subversion. It operates at the intersection of early consumer computing (Windows 95/98) and contemporary street-art culture. The personality is chaotic, aggressive, and intentionally unpolished, meant to evoke the feeling of a compromised terminal or a secret underground communication node.

The aesthetic utilizes **Brutalism** and **Retro-Tech** influences. It rejects modern "clean" design in favor of high-contrast monochrome backgrounds, pixelated artifacts, and "glitch" pops of neon color. Rage face memes and horror-inspired halftone imagery are used as core graphic elements to establish a mood of nihilistic humor and urgency. This system is designed for a target audience that values counter-culture, anonymity, and technological edge.

## Colors

The palette is anchored in a high-contrast dark mode to simulate both the "dead-drop" horror aesthetic and a terminal environment. 

- **Neon Cyan (#00FFC2):** The primary indicator for interaction, status, and essential data. It represents the "hacker" layer of the UI.
- **Deep Pink/Magenta (#FF00FF):** Used exclusively for "glitch" states, errors, and disruptive visual accents.
- **Classic Grey (#C0C0C0):** Utilized for structural elements, specifically mimicking the iconic 3D-chiseled window borders and buttons of the Windows 9x era.
- **True Black (#000000):** The primary background color, providing a canvas for high-contrast white spray-paint textures and halftone graphics.

## Typography

Typography is a clash of structured technicality and organic chaos.

1. **The Technical Layer:** Use **Space Grotesk** for headlines and labels to maintain a geometric, technical feel. All-caps styling is preferred for labels to mimic terminal outputs.
2. **The Human Layer:** Use **Lexend** for body text. Its high readability provides a necessary anchor amidst the visual noise of the background textures.
3. **The Anarchic Layer:** For large display moments, typography should be treated as an image. Apply "distorted" or "hand-drawn" graffiti effects via CSS filters or SVG masks. Characters should appear drippy, over-sprayed, or violently glitched. 
4. **The Retro Layer:** Labels should frequently use a monospaced treatment to reinforce the 90s OS and terminal aesthetic.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy that mimics a desktop OS with multiple overlapping windows. 

- **Windowed Containers:** Layouts are composed of "windows" with 2px grey borders. 
- **Intentional Overlap:** Elements should not always sit neatly side-by-side. Elements like spray-paint "tags" or "glitch" fragments should break the grid and overlap borders to create a sense of digital decay.
- **Rhythm:** A strict 4px baseline grid ensures that even while the visuals are chaotic, the underlying structure remains functional. Use heavy margins (24px) for the main viewport to contain the "clutter" within the center of the screen.

## Elevation & Depth

This system avoids modern shadows and blurs, relying instead on **Retro-Skeuomorphism** and **Hard-Edge Layering**:

- **3D Bevels:** All window containers and buttons must use the Windows 9x "outset" and "inset" border technique. An "outset" border (top/left: white, bottom/right: dark grey) creates an elevated look, while an "inset" border (top/left: dark grey, bottom/right: white) creates a pressed or input-field look.
- **Halftone Dithering:** Depth is suggested through high-contrast halftone patterns (dots) rather than soft gradients. 
- **Z-Index Anarchy:** Hierarchy is achieved through layering. The "most important" information is the top-most window in the stack. Glitch effects and "rage faces" should occasionally appear "underneath" the UI text but "above" the background to create three distinct planes of depth.

## Shapes

The shape language is strictly **Sharp (0px)**. There are no rounded corners in this design system. 

- **Hard Pixels:** Every border, container, and selection state is a perfect rectangle. 
- **Torn Edges:** For "street art" elements like stickers or torn posters, use jagged, pixelated edge masks rather than smooth curves.
- **Pixel Icons:** All icons must be strictly pixel-art style, non-aliased, and scaled without smoothing to maintain the 90s aesthetic.

## Components

- **Buttons:** Use the grey #C0C0C0 background with 2px outset borders. On hover, the border flips to inset. Text is always Space Grotesk.
- **Input Fields:** Use an inset 2px border with a black or very dark grey background. The cursor should be a blinking cyan block.
- **Cards (Windows):** Every card is a "window." It must have a title bar (blue gradient for "active", grey for "inactive") and a "close" [X] button in the top right. 
- **Chips/Tags:** Styled as "sticker" elements with white backgrounds, black jagged borders, and graffiti-style text.
- **Glitch Overlay:** A component that randomly shifts pieces of its children's content 5-10px horizontally or vertically, applied sparingly to "Secondary" action items.
- **Spray-Paint Dividers:** Instead of horizontal lines, use a white spray-paint "line" texture with drips to separate content sections.
- **Rage Face Modals:** For extreme error states or critical warnings, use high-contrast Rage Face memes (e.g., "FUUUU" for errors, "Trollface" for hidden features) as the primary visual.