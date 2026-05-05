---
name: Tokens architecture preference
description: User wants color tokens extracted to a separate file for maintainability and scalability
type: feedback
---

Extract all color/theme values into a dedicated tokens file so devs can modify the theme from one place.

**Why:** Maintainability and scalability — one place to change colors instead of hunting through globals.css.

**How to apply:** When adding or changing theme colors/surfaces/borders/text, define them in the tokens file (e.g., `app/tokens.css`). globals.css should import tokens and reference them. Don't hardcode theme values inside globals.css logic blocks.
