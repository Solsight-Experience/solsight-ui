# Design System: Solsight

## 1. Visual Theme & Atmosphere

Solsight’s design language leverages a vibrant, Web3-native aesthetic. Operating on clean white backgrounds, the primary Solsight Neon Purple (`#c36ffc`) commands attention and creates a highly energetic, modern identity. Because the primary brand color is bright, UI elements rely heavily on high-contrast pairings, using deep, cool-toned blacks to maintain legibility in dense data environments like routing tables or swapping interfaces.

**Key Characteristics:**

- Solsight Neon Purple (`#c36ffc`) as the primary brand, supported by darker, accessible variants (`#9840d6`, `#6e20a0`).
- Solsight-Brand (display) + Solsight-Product (UI) dual font system.
- Obsidian Black (`#110f14`) text to ground the vibrant purple.
- 12px radius buttons (rounded but not pill).
- Subtle shadows (`rgba(0,0,0,0.03) 0px 4px 24px`) to lift swap cards and modal windows.
- Mint Green accent (`#14f195` spectrum) for positive/success states, tying into the broader ecosystem aesthetic.

## 2. Color Palette & Roles

### Primary

- **Solsight Neon Purple** (`#c36ffc`): Primary brand, active states, highlights.
- **Solsight Dark** (`#9840d6`): Button borders, outlined variants, small links (WCAG accessible on white).
- **Solsight Deep** (`#6e20a0`): Deepest purple for hover states on dark variants.
- **Purple Subtle** (`rgba(195,111,252,0.16)`): Neon Purple at 16% — subtle button backgrounds and selected row states.
- **Obsidian Black** (`#110f14`): Primary text and primary button text.

### Neutral

- **Cool Gray** (`#686b82`): Primary neutral, borders at 24% opacity.
- **Silver Blue** (`#9497a9`): Secondary text (e.g., token contract addresses, muted labels).
- **White** (`#ffffff`): Primary surface for the app body and elevated cards.
- **Border Gray** (`#dedee5`): Divider borders between transaction rows.

### Semantic

- **Mint Success** (`#00b87c`): Accessible success color for icons and standalone text.
- **Success Badge** (`rgba(20,241,149,0.16)`): Background for positive state badges (e.g., "Confirmed").
- **Success Badge Text** (`#006b44`): High-contrast text for success badges.

## 3. Typography Rules

### Font Families

- **Display**: `Solsight-Brand`, fallbacks: `IBM Plex Sans, Helvetica, Arial`
- **UI / Body**: `Solsight-Product`, fallbacks: `Helvetica Neue, Helvetica, Arial`

### Hierarchy

| Role            | Font             | Size | Weight  | Line Height | Letter Spacing |
| --------------- | ---------------- | ---- | ------- | ----------- | -------------- |
| Display Hero    | Solsight-Brand   | 48px | 700     | 1.17        | -1px           |
| Section Heading | Solsight-Brand   | 36px | 700     | 1.22        | -0.5px         |
| Sub-heading     | Solsight-Brand   | 28px | 700     | 1.29        | -0.5px         |
| Feature Title   | Solsight-Product | 22px | 600     | 1.20        | normal         |
| Body            | Solsight-Product | 16px | 400     | 1.38        | normal         |
| Body Medium     | Solsight-Product | 16px | 500     | 1.38        | normal         |
| Button          | Solsight-Product | 16px | 600     | 1.38        | normal         |
| Caption         | Solsight-Product | 14px | 400–700 | 1.43–1.71   | normal         |
| Small           | Solsight-Product | 12px | 400–500 | 1.33        | normal         |
| Micro           | Solsight-Product | 7px  | 500     | 1.00        | uppercase      |

## 4. Component Stylings

### Buttons

_Note: Because `#c36ffc` is a bright, high-luminance color, white text will fail accessibility standards. Primary buttons use Obsidian Black text for a sharp, high-contrast Web3 look._

**Primary Neon**

- Background: `#c36ffc`
- Text: `#110f14`
- Padding: 13px 16px
- Radius: 12px
- Hover: Lighten background slightly or apply an inner shadow.

**Purple Outlined**

- Background: `#ffffff`
- Text: `#9840d6` _(Using the Dark variant here ensures readability)_
- Border: `1px solid #9840d6`
- Radius: 12px

**Purple Subtle**

- Background: `rgba(195,111,252,0.16)`
- Text: `#9840d6`
- Padding: 8px
- Radius: 12px

**Secondary Gray**

- Background: `rgba(148,151,169,0.08)`
- Text: `#110f14`
- Radius: 12px

### Badges

- **Success**: `rgba(20,241,149,0.16)` bg, `#006b44` text, 6px radius
- **Neutral**: `rgba(104,107,130,0.12)` bg, `#484b5e` text, 8px radius

## 5. Layout Principles

### Spacing

1px, 2px, 3px, 4px, 5px, 6px, 8px, 10px, 12px, 13px, 15px, 16px, 20px, 24px, 25px

### Border Radius

3px, 6px, 8px, 10px, 12px, 16px, 9999px, 50%

## 6. Depth & Elevation

- **Subtle (Cards/Modals)**: `rgba(0,0,0,0.03) 0px 4px 24px`
- **Micro (Dropdowns/Tooltips)**: `rgba(16,24,40,0.04) 0px 1px 4px`

## 7. Do's and Don'ts

### Do

- Use Solsight Neon Purple (`#c36ffc`) for primary CTAs like "Connect Wallet" or "Swap".
- Use Obsidian Black (`#110f14`) for text on top of the Neon Purple background to ensure WCAG readability.
- Apply 12px radius on all buttons.

### Don't

- Don't use white text on the `#c36ffc` background—it creates visual strain.
- Don't use pill buttons—12px is the max radius for UI buttons to maintain a structured, technical feel.

## 8. Agent Prompt Guide

### Quick Color Reference

- Brand: Solsight Neon Purple (`#c36ffc`)
- Dark variant: `#9840d6` (Use for purple text/outlines)
- Text: Obsidian Black (`#110f14`)
- Secondary text: `#9497a9`
- Background: White (`#ffffff`)

### Example Component Prompts

- "Create swap interface card: white background, subtle shadow. Solsight-Brand 28px weight 700. Primary CTA button (#c36ffc background, #110f14 text, 12px radius). Add a success badge for 'Best Route' using rgba(20,241,149,0.16) background and #006b44 text."
