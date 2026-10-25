---
name: Terrace
description: A match broadcast control desk for reverse correct-score demo betting.
colors:
  bg: "#0e1312"
  panel: "#171d1b"
  raised: "#202724"
  line: "#2d3531"
  muted: "#a1aaa5"
  ink: "#f2f3ed"
  orange: "#eeb66a"
  green: "#a9d4a2"
  red: "#ec9993"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "49px"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.8px"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    letterSpacing: "-0.6px"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  market-caption:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    lineHeight: 1.45
    letterSpacing: "0"
  score:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  yield:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 500
rounded:
  score: "5px"
  control: "6px"
  wallet: "7px"
  card: "10px"
  feature: "12px"
  dialog: "14px"
spacing:
  score-gap: "5px"
  control-gap: "8px"
  card-gap: "12px"
  card-inset: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  score-button-chosen:
    backgroundColor: "{colors.orange}"
    rounded: "{rounded.score}"
  match-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

# Design System: Terrace

## Overview

**Creative North Star: "The Match Broadcast Control Desk"**

A near-black working desk with green-grey panels, warm broadcast orange, condensed matchday lettering and tabular scores. Stadium photography supplies atmosphere in a restrained banner; dense controls, shared rules and a repeated score grid supply the working hierarchy. The English-first interface retains 反波胆 as the market identifier and explicitly labels demo credits and simulated results.

**Key Characteristics:**

- Flat tonal surfaces and thin shared rules.
- Condensed display typography paired with precise sans-serif controls.
- Orange selected score linked directly to the bet slip.
- Persistent desktop workspace and stacked mobile flow.

User delegated design and approved code-first execution. Mode: Operate. No approved comp.

Grounded candidate set: football programme; supporters' fanzine; exchange terminal; stadium wayfinding; training tactics board; ticket ledger; match broadcast control desk (assigned candidate 7, seed 0141d4ff).

Challengers: metro tile interface declined (audience identification and risk clarity weaker); kept selection clarity. Timetable rack declined (raked forms impede dense pricing); kept precise column discipline. Streaming wall declined (conceals essential odds); kept active selection focus. Cassette card declined (poor betting identification and clarity); kept ledger continuity. Airport signage competitive on clarity, weaker audience identification; kept plain directional actions. Barcode field declined on both axes; kept tabular rigor. No motifs borrowed.

## Colors

The palette reads as stadium darkness, green-grey equipment surfaces and a warm broadcast cue. Frontmatter records the built root CSS tokens; components also use nearby green-tinted shades.

### Primary

- **Broadcast Orange** (`orange`): selected score, primary action, brand detail, return emphasis and shared focus outline.

### Secondary

- **Pitch Green** (`green`): positive amounts and live/feed status, paired with text.
- **Result Red** (`red`): loss and negative amounts, paired with signs and status words.

### Neutral

- **Stadium Black** (`bg`): canvas.
- **Desk Panel** (`panel`) and **Raised Green-Grey** (`raised`): surface vocabulary.
- **Shared Rule** (`line`): panel boundaries and section dividers.
- **Soft Chalk** (`ink`) and **Equipment Grey** (`muted`): primary and supporting text.

**The Selection Link Rule.** A chosen score uses orange and populates the slip with that exact match, excluded score and return.

## Typography

**Display Font:** self-hosted Barlow Condensed, sans-serif fallback.
**Body Font:** self-hosted DM Sans, sans-serif fallback.

The hero uses bold condensed type; responsive sizes range from 39–57px, with 48px on mobile. Wallet/history headings use the same face at 32–42px. Competition headings use DM Sans at 18–21px; body defaults to the frontmatter role. Dialog prose uses 12px with a 1.8 line height. Numeric balances, prices and scores use tabular figures.

**The Readable Market Rule.** Final market captions and return percentages stay 11px across breakpoints; score labels stay 12px and percent signs 9px. These final CSS overrides take precedence over earlier compact breakpoint rules. Fit the grid through layout before reducing decision-critical figures.

Risk input is 18px, excluded score 28px, total return 25px (23px mobile), and wallet balance 42px with responsive adjustment. Supporting metadata uses 8–11px; badge initials and decorative banner lettering are smaller.

## Layout

The desktop workspace is centered with a 1800px maximum width. Baseline columns are 208px navigation, a flexible board with 400px minimum, and 306px slip. Main horizontal insets are 29px; the masthead is 78px high. Navigation and slip are sticky. Match cards repeat with a 12px gap, teams beside a six-column score grid on wide screens. Tiles stack score and yield, with 60px minimum height; extra runners can scroll within a 225px-high score region.

Breakpoints are 1500, 1250, 1000, 800 and 620px. Intermediate widths narrow rails and stack teams above pricing. At 800px the rail disappears, retaining board/slip columns. At 620px the desk becomes one column with 16px main insets, a 66px masthead and 65px fixed bottom navigation. The slip follows the board in normal flow with 90px bottom padding; selecting a score scrolls to it. Match identity and excluded score share its first mobile row, then risk and returns span the width.

## Elevation & Depth

Ordinary panels are flat, separated by tonal surfaces and thin rules. The hero uses a dark directional image overlay. Shadows are reserved for overlays: dialog `0 25px 100px #0009`; toast `0 8px 30px #0006`. The native dialog has a dark translucent backdrop.

## Shapes

Compact rounded corners follow the frontmatter vocabulary: broad feature panels, tighter match cards and small controls. Dividers are straight and thin. Club identifiers use shield silhouettes with initials; the brand mark uses three stepped strokes. Circular forms are limited to status dots, profile and small illustration details.

## Components

### Buttons and navigation

Primary actions use orange, dark text, bold 11px type, 43px minimum height and a warmer hover fill. Secondary actions use a thin border; text actions pair labels with directional icons. Filters use a green-tinted selected state. Disabled buttons reduce opacity and use a blocked cursor. Desktop navigation uses an orange masthead underline and green-tinted selected rail item; mobile uses icon/label buttons with orange active state.

The shared keyboard-focus style is a 2px orange outline with 4px offset. Preserve visible focus when extending controls; specialized input resets need checking independently. Default color/background/border transitions take 180ms with ease.

### Match cards and score tiles

Cards contain status/time, watchlist flag, teams, score choices and rules footer. Tiles use a green-grey border, compact corners and two numeric lines. Hover brightens the surface and border; selection fills orange with dark text. Buttons expose descriptive accessible names and aria-pressed state.

Settled matches show DEMO FT and the simulated final result. Both team scoreboard numbers derive from that same final result, replacing any earlier in-play score. Settled and stale-feed score choices are disabled. Explicit result labels accompany dimmed settled state.

### Bet slip, wallet and history

The slip shows teams, excluded score, AGAINST marker, labeled CR risk input, 100/250/500/Max shortcuts, maximum loss, potential profit and prominent total return. Changes calculate immediately. Placement reserves credits, clears selection and announces confirmation. A single 300ms slide/clip transition uses cubic-bezier(.16,1,.3,1).

Wallet balances use tabular figures with CR units. History repeats the card surface with explicit OPEN/WON/LOST labels, signs and semantic colors. Empty states explain the next action.

### Dialogs, feedback and accessibility

Help, API setup and simulated settlement use native modal dialogs with close action, Escape and backdrop dismissal, maximum width 490px and maximum height 90vh. Inline errors and storage warnings use alert roles; toast confirmations use status. Icon-only actions have accessible names; decorative brand/club graphics are hidden from assistive technology. A skip link targets main content. Text identifies demo mode, feed freshness and outcomes alongside color.

Reduced-motion CSS removes animations/transitions and makes CSS scrolling automatic. Current selection/navigation handlers also issue explicit smooth-scroll calls; this documentation does not claim those calls are suppressed.

## Do's and Don'ts

### Do:

- **Do** keep selected score, slip and settlement scoreboard consistent with match state.
- **Do** preserve the final market figure sizes at every breakpoint.
- **Do** expose maximum loss, potential profit and total return before placement.
- **Do** retain demo, freshness and outcome text alongside color.
- **Do** reuse self-hosted fonts, compact corners, thin rules and tabular figures.

### Don't:

- **Don't** invent live statistics, official outcomes or standings.
- **Don't** let imagery or activity tickers displace working odds.
- **Don't** add routine card shadows that compete with overlays.
- **Don't** present simulated credits or results as cash or verified outcomes.
