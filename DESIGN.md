# Pawred — Design system

World: the dog-show ring. Oat paper ground, evergreen show-ring felt sections, a marigold rosette accent. Warm and editorial; dog photography is the hero.

## Color (tokens in `src/app/globals.css`, used as Tailwind classes)
| Token | Hex | Use |
|---|---|---|
| `paper` | #F4EDE1 | page ground |
| `paper-deep` | #EBE1D0 | alternate section, image placeholders |
| `card` | #FFFCF6 | cards, sheets |
| `ink` / `ink-soft` | #1E1A16 / #5B5248 | text / secondary text |
| `line` | #D9CDB9 | hairlines, borders |
| `felt` / `felt-raised` | #16352A / #1F4637 | full-width dark sections, footer, match screen |
| `on-felt` / `on-felt-soft` | #F4EDE1 / #B8CBBD | text on felt |
| `marigold` / `marigold-deep` | #E8A13A / #C9831F | the only accent: likes, primary actions, focus ring |
| `verified` | #3C6A48 | Verified badges, health checks |

Marigold buttons always carry ink text (never white).

## Type
- Display: **Gloock** (`font-display`), headings and dog names. Sizes use `clamp()`; tracking no tighter than -0.02em.
- Text: **Figtree** (`font-sans`), 16px minimum body, line-height 1.55.
- No eyebrow labels above headings.

## Shape and depth
- Radii: 28px large cards, 20–24px inner plates, full pill for buttons and chips.
- Shadows are soft and offset downward (`0 30px 60px -30px`), never hard offset.

## Components
- Primary button: marigold pill, 56px tall on marketing, 48px in app.
- Secondary: ink pill, or underlined text link.
- Like button: 52px round card-coloured button with a marigold heart; fills marigold when active.
- Chips: pill with `line` border and a Lucide icon.
- Icons: Lucide only, 1.5–2.2 stroke.

## Motion
- One authored moment: like → comment sheet slides up → match screen opens with a circular wipe.
- Scroll reveals move content up 32px; content is always visible without JavaScript.
- `MotionConfig reducedMotion="user"` respects reduced-motion settings.
- Animmaster components belong on marketing pages only (slots are marked in code comments).
