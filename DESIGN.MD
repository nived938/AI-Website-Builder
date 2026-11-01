# Design System: Midnight Atelier (VEYRA Studio)

The VEYRA Studio visual identity is **Midnight Atelier**, synthesized and exported directly from Google Stitch project `projects/2114857465885207418` (Design Asset: `assets/11781549634845847867`).

## 1. Color Palette

| Token Name | Hex Code | Purpose & Usage Rules |
| :--- | :--- | :--- |
| **Deep Background** | `#0B1020` | Root canvas, ambient background, base viewport substrate |
| **Graphite** | `#111827` | Primary card surfaces, navigation sidebars, toolbars |
| **Surface Elevated** | `#1A2234` | Popovers, dropdown menus, modals, active tabs |
| **Porcelain** | `#F4F3EF` | Primary text headings, body content, high-contrast labels |
| **Secondary Text** | `#929BAD` | Subtitles, metadata, timestamps, input placeholders |
| **Luminous Mint** | `#C8FF70` | Primary CTA buttons, build actions, positive indicators |
| **Electric Violet** | `#8B75FF` | AI tokens, copilot thinking stream, reasoning effort pill |
| **Border Subtle** | `#1F293D` | 1px hairline container borders and dividers |
| **Error / Alert** | `#FF6B6B` | Destructive actions, build errors, payment failure warnings |

## 2. Typography Rules
- **Interface & Headings**: `Manrope` (Clean, modern geometric sans-serif with high legibility across dense views).
- **Code, Logs & Telemetry**: `JetBrains Mono` / monospace font for code blocks, token counts, JSON view, and file paths.

## 3. Geometric Rules & Corner Radii
- **Base Containers & Cards**: `rounded-lg` (8px corner radius).
- **Buttons & Interactive Pills**: `rounded-md` (6px) or `rounded-full` (for status badges and filter chips).
- **Modals & Drawers**: `rounded-xl` (12px to 16px).

## 4. Component Standards
- **Buttons**:
  - *Primary*: Luminous Mint (`#C8FF70`), dark text (`#0B1020`), font-semibold, hover brightness 105%.
  - *AI Actions*: Electric Violet (`#8B75FF`), porcelain text (`#F4F3EF`), subtle violet glow.
  - *Secondary / Ghost*: Transparent surface, 1px graphite border (`#1F293D`), porcelain text.
- **Form Controls**: Dark graphite background (`#111827`), subtle border (`#1F293D`), focus ring in luminous mint.
- **Code Editor**: Monaco/CodeMirror theme matching Deep Background (`#0B1020`) with Electric Violet line highlights for AI changes.
