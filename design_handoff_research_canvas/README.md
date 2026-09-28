# Handoff: Research Canvas Restyle

## Overview
A visual restyle of the existing AI research canvas (node/flow editor). The pipeline and data stay the same: participant transcripts → Insight Weaver → Journey Mapper → Patient Safety Reviewer → UX Coach. The goal is to make it easier to read at a glance: calmer containers, one identity colour per step, cleaner headers, and outputs shown as visuals (ranked bars, emotion curve, review lists) rather than walls of text.

**This is a restyle of an app that is already built.** Keep the current architecture, canvas library, node types, data flow, API calls and state. Change presentation (styles, header/footer anatomy, output rendering) and the few small interactions listed below.

## About the design files
`Research Canvas Restyle.dc.html` is a **design reference made in HTML**. It is not production code. Open it in a browser (keep `support.js` next to it) to inspect it. Recreate the look and behaviour in the existing codebase, using its components, styling approach and patterns. The data in the mock is sample content; always render the real model outputs.

## Fidelity
**High fidelity.** Colours, type, spacing, radii and states are final. Match them closely using the codebase's styling system. Map the tokens below to CSS variables or theme tokens rather than hard-coding them.

---

## Global rules (apply everywhere)

1. **Colour has meaning.**
   - Each AI step has one identity colour, used only on its number tile, its ports and its own data marks (bars, curve, progress).
   - **Amber** means friction or medium severity. **Red** means high risk or a risk tag. Never use either as a node's identity colour.
   - Everything else is neutral grey. No tinted node headers, no coloured group backgrounds, no full-width coloured buttons.
2. **Drop the noise.** Remove the "Box" suffix from node names, the duplicate type label in the header's top-right ("Insight Weaver", "Text Context"…), the × close button on every node (move it into a `⋯` menu or keyboard delete) and emoji icons.
3. **Minimum text size is 10.5px** (mono labels only). Body text is 13–13.5px.
4. **Ports sit on the header's centre line** (not at mid-node height), so the AI steps connect in one straight horizontal line.

---

## Design tokens

### Colour
| Token | Value | Use |
|---|---|---|
| `canvas-bg` | `#EEF0F3` | Canvas background |
| `canvas-dot` | `rgba(22,24,29,.14)` | Dot grid, 1px dots, 22px spacing |
| `surface` | `#FFFFFF` | Nodes, top bar, buttons |
| `surface-sunken` | `#F6F7F9` | Quote boxes, open rows, hover |
| `surface-muted` | `#F1F3F5` | Neutral pills, trace chips |
| `border` | `#DCDFE4` | Node border |
| `border-control` | `#D3D7DD` | Secondary button border |
| `divider` | `#ECEEF1` | Header/footer dividers inside nodes |
| `divider-soft` | `#E4E7EB` | Card borders, progress track |
| `ink` | `#16181D` | Primary text, primary button, participant tiles |
| `ink-hover` | `#2D3038` | Primary button hover |
| `text-2` | `#3A3E46` | Body copy |
| `text-3` | `#474B53` | Secondary copy |
| `text-muted` | `#626771` | Subtitles, meta, token counts |
| `text-faint` | `#6E737C` | Mono section labels |
| `icon-muted` | `#8A8F98` | Carets, disabled text |
| `edge` | `#A3A8B1` | Connector lines (1.5px) |
| `edge-waiting` | `#B9BDC4` | Dashed connector (`4 5`) to steps not run yet |
| `group-fill` | `rgba(255,255,255,.45)` | Group frame fill |
| `group-border` | `rgba(22,24,29,.10)` | Group frame border |

**Step identity colours** (tile background, ports, data marks; white text on top):
| Step | Colour | ≈ hex |
|---|---|---|
| Inputs (participants) | `#16181D` (ink) | — |
| 1 Insight Weaver | `oklch(0.50 0.13 250)` | `#2B63AE` blue |
| 2 Journey Mapper | `oklch(0.50 0.15 293)` | `#6448B8` violet |
| 3 Patient Safety Reviewer | `oklch(0.50 0.085 190)` | `#1C7373` teal |
| 4 UX Coach | `oklch(0.50 0.11 150)` | `#2F7A45` green |

**Semantic colours**
| Token | Value | ≈ hex | Use |
|---|---|---|---|
| `amber-bg` | `oklch(0.95 0.05 85)` | `#F8EDD2` | Friction chip, Medium chip, "to review" pill |
| `amber-band` | `oklch(0.96 0.045 85)` | `#FAF1DA` | Friction band behind the journey chart |
| `amber-text` | `oklch(0.45 0.10 65)` | `#7A5316` | Text on amber |
| `amber-dot` | `oklch(0.74 0.15 72)` | `#DDA23A` | Status dot |
| `red-bg` | `oklch(0.95 0.035 25)` | `#F9E6E3` | High chip, risk category tag |
| `red-border` | `oklch(0.85 0.07 25)` | `#EDBDB6` | "Human review required" outline tag |
| `red-text` | `oklch(0.48 0.17 27)` | `#B02A22` | Text on red |
| `violet-bg` | `oklch(0.95 0.03 293)` | `#EEEBF8` | "Affected journey stage" chip |
| `violet-text` | `oklch(0.42 0.14 293)` | `#4F3A99` | Text on violet chip |
| `green-bg` | `oklch(0.95 0.04 150)` | `#E3F3E6` | Next-step number circles |
| `low-bg` / `low-text` | `#EDEFF2` / `#565B64` | — | Low severity chip |
| `dismissed` | `#B3B8C0` | — | Dismissed segment in progress bar |

(Use the `oklch()` values directly if the target browsers support them; the hex values are fallbacks.)

### Typography
- **UI font:** Instrument Sans (Google Fonts, 400/500/600/700).
- **Mono font:** IBM Plex Mono (400/500/600), used for tiles, counts, token numbers, section labels and emotion words.

| Role | Font | Size / line-height | Weight | Other |
|---|---|---|---|---|
| Node title | Sans | 14 / 1.25 | 600 | |
| Node subtitle | Sans | 12 / 1.35 | 400 | `text-muted`, 2px above |
| Row title (theme, stage, flag) | Sans | 13.5 / 1.35 | 500 (theme) / 600 (stage, flag) | `text-wrap: pretty` |
| Body copy | Sans | 13 / 1.5 | 400 | `text-2` |
| Quote | Sans | 12.5 / 1.5 | 400 | wrapped in “ ” |
| Button | Sans | 13 (12.5 small) | 500 | |
| Section label | Mono | 10.5 | 400–600 | uppercase, letter-spacing .06em, `text-faint` |
| Group label | Mono | 11 | 600 | uppercase, letter-spacing .08em |
| Tile text | Mono | 11.5 (P1) / 13 (1–4) | 600 | |
| Token count / meta | Mono | 11–11.5 | 400 | `text-muted` |

### Radius
Group frame 16 · Node 12 · Card or open row 9–10 · Button 8 · Tile 8 · Quote box 8 · Chip 5 · Pill 11 (full) · Progress segment 3.

### Shadow
- Node: `0 1px 2px rgba(22,24,29,.05), 0 10px 28px -14px rgba(22,24,29,.22)`
- Open card inside a node: `0 1px 3px rgba(22,24,29,.06)`
- Floating controls (zoom): `0 4px 14px -6px rgba(22,24,29,.2)`

### Spacing
A 4px base: 4, 6, 8, 10, 12, 14, 16, 20. The values used for each component are given below.

---

## Canvas layout
- Background `canvas-bg` with a dot grid: `radial-gradient(circle, rgba(22,24,29,.14) 1px, transparent 1.4px)` at `22px 22px`.
- Top bar: 56px, white, 1px bottom border `#DDE0E5`, padding 0 20px. Left: the project name (14/600). Right: `Export` (secondary) and `Run all` (primary with a play icon). Buttons are 34px tall, 0 14px padding, radius 8, 7px icon gap.
- Flow reads left to right. Tops align: every node header centre is on the same y, so AI→AI connectors are straight.
- Reference positions (1:1 in the mock): Inputs group at x 32, width 320. Pipeline group at x 424. Nodes inside the pipeline are 72px apart. Node widths: Insight Weaver 380, Journey Mapper 500, Patient Safety Reviewer 400, UX Coach 400. Participant nodes are 288 wide (group width minus 16px padding each side).
- Zoom control: a floating pill at the bottom centre (white, border `border`, radius 10, padding 4).

## Group frames (replaces the yellow and blue slabs)
- Fill `group-fill`, 1px `group-border`, radius 16, padding `0 16px 16px` (inputs) or `0 20px 20px` (pipeline).
- Header row is 46px tall with a mono uppercase label and count: `RESEARCH INPUTS  4`, `AI RESEARCH PIPELINE  4 steps`. The label is `text-3` 600 and the count is `text-faint`.
- There is no pill background on the label.
- Stack children with gap 12 (inputs, vertical) or 72 (pipeline, horizontal).

## Node anatomy (all node types)
```
┌──────────────────────────────────────────┐
│[tile] Title                    [status]  │ ← header 56px
│       Subtitle (result summary)          │
├──────────────────────────────────────────┤ ← 1px divider
│ body (scrolls if needed)                 │
├──────────────────────────────────────────┤
│ 2,131 tokens                  [↻ Rerun]  │ ← footer 46px
└──────────────────────────────────────────┘
```
- **Container:** white, 1px `border`, radius 12, node shadow. `overflow: visible`, so ports can hang outside.
- **Header:** 56px, `box-sizing: border-box`, flex row, align centre, gap 10, padding `0 10px 0 12px`, bottom border 1px `divider`.
  - **Tile:** 30×30, radius 8, centred mono text. Participants show `P1`… on ink. AI steps show `1`–`4` on their identity colour. Text is white.
  - An empty input (no file yet) gets a white tile with a 1.5px dashed `#B9BDC4` border and `text-muted` text.
  - **Title** is the plain name without "Box". **Subtitle:**
    - Before running: the short description ("Finds themes in your transcripts", "Maps where users struggle", "Flags patient-safety risks", "Suggests what to do next").
    - After running: a result summary ("5 themes · from 3 transcripts", "5 stages · friction in 3", "5 flags · 1 stage clear", "2 recommendations · from approved flags").
  - **Status pill** (22px tall, padding 0 8, radius 11, 11.5px):
    - `Done`: `surface-muted` background, `text-3`, with a check icon.
    - `N to review`: `amber-bg` background, `amber-text` 600, with a 6px `amber-dot`.
    - `Reviewed`: same as Done.
    - `Ready`: white with a 1px `border-control` border.
    - `Waiting`: `surface-muted` background, `text-faint`.
- **Ports:** 14×14 circles, `box-sizing: border-box`, filled with the node's colour, 2.5px white border, `0 0 0 1px rgba(22,24,29,.2)` ring. Place them at `top: 21px` (header centre) and `left/right: -8px`. An unconnected or empty port uses fill `#E3E6EA`.
- **Connectors:** cubic bezier with a horizontal tangent at both ends (`dx = max(36, (x2-x1) * 0.5)`), stroke `edge` 1.5px, no arrowheads.
  - A connector into a step that hasn't run yet is dashed (`4 5`, `edge-waiting`).
- **Footer:** 46px, top border 1px `divider`, padding `0 8px 0 14px`. Left: mono token total (`2,131 tokens`), or `Not run yet`. Right: a small `Rerun` button (30px tall, 0 12 padding, white, 1px `border-control`, radius 8, 12.5/500, rotate-ccw icon 13px). The old full-width coloured Run bar is removed.
- **Empty (not run) body:** centred column, padding 32/28, gap 14.
  - It holds a description (13.5/1.55, `text-3`, max-width ~280), a `Run` button and a mono hint below it.
  - Step 1 is ready: primary ink Run button, hint "3 transcripts connected".
  - Downstream steps are waiting: disabled Run (`#EDEFF2` background, `icon-muted` text, `not-allowed` cursor), hint "Runs after <previous step>".

## Node-specific designs

### Participant (Text context)
- Title `Participant P1`, subtitle `Interview transcript`. Output port on the right.
- Body padding `12px 14px 14px`, 13/1.5 `text-2`. By default it shows the transcript **clamped to 3 lines** (`-webkit-line-clamp: 3`).
  - Offer an expanded view that shows the full text in a scroll area (max-height ~132px, 8px between paragraphs).
- Remove the repeated "Participant P1" first line from inside the text.

### Participant (Documents / upload)
- Subtitle `Documents`, dashed tile, grey port.
- The dropzone has 12px padding around it and a 1.5px dashed border `#CBCFD5`, radius 10, background `#F8F9FA` (hover `#F1F3F5`), padding 12/14.
  - Inside is a 32px white icon box with an upload icon, then "Click or drop files" (13/600) and "PDF, DOCX, TXT" (mono 11, muted).

### 1 · Insight Weaver (themes)
- Body padding `4px 8px 10px`.
- Column header row: mono labels `THEME` (left, indented 34px) and `MENTIONS` (right).
- Sort themes by count, highest first.
- Each row: padding 10, gap 10, radius 9, hover `#F4F5F7`, clickable.
  - Left: a 14px caret (rotates 90° when open, 150ms).
  - Then the title (13.5/500).
  - Then a mentions bar: 44×6 track `#E9EBEE`, fill in step colour, width = count / max count.
  - Then the count (mono 12/500, right-aligned in a 12px column).
- Open row: background `surface-sunken`. Below the title, indented 34px, list the supporting quotes, 6px apart.
  - Each quote card is white, 1px `divider-soft`, radius 8, padding 9/11, and has an ink mono chip (`P3`, 10.5/600, radius 4) followed by the quote.
- Per-theme Rerun is removed from the row. If needed, put it in the row's `⋯` menu or show it on hover.
- One row open at a time; the first is open by default.

### 2 · Journey Mapper
Body padding `14px 16px 0`, two parts:

**a) Emotion chart**
- Label `EMOTION BY STAGE`.
- Chart area is 468×168 (scale to node width).
  - Stages are 5 equal columns. Each point sits at its column centre.
  - Y maps an emotion score to a height: top padding 26, bottom padding 30. Sample scores: Optimistic 82, Uncertain 52, Frustrated 28, Exasperated 12, Relieved 70.
- **Line:** a smooth curve (Catmull-Rom → bezier, horizontal tangent at the minimum), 2.5px in the step colour, round caps.
  - Area fill under it: a vertical gradient of the step colour from 16% to 0% opacity.
  - Points are white circles (r 4.5) with a 2px step-colour stroke. The lowest point is filled (r 5.5) and labelled `Lowest point` (mono 10.5, `#565B64`) underneath.
- **Friction band:** a continuous `amber-band` rectangle behind the friction stages, from the chart top through the stage labels, radius 6 at the top.
  - Its label sits at the top-left: an alert icon plus `FRICTION · 3 STAGES` (mono 10.5/600, `amber-text`).
  - Compute the band from contiguous friction stages. If they aren't contiguous, draw one band per stage.
- **Stage labels:** 5-column grid under a 1px `divider-soft` line. Each cell holds the number `01` (mono 10.5, faint), the name (12.5/600) and the emotion (mono 10.5 uppercase, `text-3`).

**b) Stage list (keep the existing expandable detail)**
- Scroll area, max-height ~330px, gap 4, margin-top 12.
- Row: caret, `1. Referral Initiated` (13.5/600), a `⚠ Friction` chip when relevant (amber, 20px tall, radius 5, 11.5/600), and the emotion on the right (mono 10.5, 84px right-aligned).
- An open row is a white card with a 1px `border` border. The body is indented 34px:
  - The stage description (13/1.5).
  - Then a **Linked theme** card (1px `divider-soft`, radius 8, padding 10/12) containing the `LINKED THEME` label, the theme name (13/600), the insight (12.5/1.5) and a quote box.
- **Quote box (shared):** `surface-sunken`, radius 8, padding 10/12. It holds the quote in “ ”, then a row with `— Participant P3` (12px, `#565B64`) on the left and `READ-ONLY` (mono 10, `icon-muted`) on the right.
  - It replaces the old left-border italic quote.

### 3 · Patient Safety Reviewer
- **Review summary:** below the header, with a divider under it, padding 12/14.
  - Text: `0 of 5 reviewed` (13/600), or `All 5 flags reviewed`.
  - Under it, a **segmented progress bar**: one segment per flag, 6px tall, gap 4, radius 3. Pending `#E4E7EB`, approved teal, dismissed `#B3B8C0`. Animate the background over 200ms.
- **Flag list:** padding 8, gap 4, scrolls (max-height ~600). The flags work as an accordion, and all of them stay visible as compact rows.
  - **Row:** padding 9/10, radius 9, hover `surface-sunken`.
    - Left: a severity chip, 58px wide and 20px tall, radius 5, mono 10.5/600 uppercase. `HIGH` is red, `MEDIUM` amber, `LOW` grey.
    - Then the title (13.5/600; `text-muted` once reviewed) and a meta line `Category · Stage` (12, muted).
    - Right: `Approved` (mono 11/600 in teal) or `Dismissed` (grey) once reviewed.
  - **Open card:** white, 1px border, subtle shadow. Detail padding `2px 12px 12px`, gap 10, in this order:
    1. Tags: the risk category (`Communication Risk`, `red-bg` / `red-text`, 22px, radius 5, 11.5/600) and `Human review required` (outline 1px `red-border`, `red-text`, 11.5/500).
    2. `Affected journey stage` (12.5, `text-3`) followed by a violet chip with the stage name.
    3. `REASON FOR FLAGGING` label and paragraph.
    4. `EVIDENCE TRACE` label, then chips `Stage` → `Theme` (`surface-muted`, radius 5, padding 3/8, 12px) joined by a grey `→`.
    5. Quote box with Read-only.
    6. Actions: `Approve` (primary ink) and `Dismiss` (secondary), each `flex: 1`, 32px tall. Once reviewed, show a small `Undo` instead.
- **Behaviour:** Approve or Dismiss records the decision, updates the progress bar and the header pill (`N to review` → `Reviewed`), and opens the next unreviewed flag automatically.

### 4 · UX Coach
- Identity colour green. Input port only.
- The body is an accordion of recommendation cards (padding 8, gap 4, scrollable).
  - **Row:** caret, a `Responds to · Communication Risk` tag (red chip, 20px, 11/600), the title (13.5/600, 1.4) and the review state on the right (`Approved` in green, or `Dismissed`).
  - **Open card:** indented 34px, gap 12:
    - `Affected journey stage` with a violet chip.
    - `WHY IT MATTERS` label and paragraph.
    - `NEXT STEPS` label and a numbered list. Each number is an 18px circle in `green-bg` with green mono text; the text is 13/1.5, 6px between items.
    - Approve / Dismiss (or Undo), same as Safety.
- The header pill shows `N to review`, or `Reviewed` when all are decided.

---

## Interactions & state (add to existing state; don't replace data flow)
| State | Type | Behaviour |
|---|---|---|
| `openThemeIndex` | number or null | Accordion on Insight Weaver; default 0 |
| `openStageIndex` | number or null | Accordion on the Journey Mapper list; default 0 |
| `openFlagIndex` | number or null | Accordion on Safety; auto-advances to the next unreviewed flag |
| `flagReview[id]` | `'approved'` / `'dismissed'` / unset | Drives chips, progress and pill; supports undo |
| `coachReview[id]` | same | Drives coach states and pill |
| `transcriptExpanded[id]` | boolean | 3-line clamp vs full text scroll |
| node `status` | `idle` / `ready` / `waiting` / `done` / `needsReview` | Pick the status pill, subtitle (description vs result summary), body (empty vs output), footer and connector style |

- Derived values: theme bar width = count / max count; header subtitles are built from the output (theme count, stage count, friction count, flag count, clear-stage count).
- Transitions: caret rotation 150ms, background colour 150–200ms, no other animation.
- Hover: rows use `surface-sunken` or `#F4F5F7`, secondary buttons `#F3F4F6`, the primary button `ink-hover`.
- If the canvas library measures handle positions, set the handle's y to the header centre (29px from the node's outer top, including the 1px border).

## Icons
These are simple 24px-grid stroke icons at a 1.8–2.4 stroke: play (filled), rotate-ccw (rerun), chevron-right (caret), check, upload, alert-triangle, download. Use the codebase's existing icon set (Lucide equivalents work well). Do not use emoji.

## Copy changes
- Node names: `Insight Weaver`, `Journey Mapper`, `Patient Safety Reviewer`, `UX Coach` (drop "Box").
- Group labels: `RESEARCH INPUTS`, `AI RESEARCH PIPELINE`.
- Empty states:
  - Insight Weaver: "Reads the connected transcripts and groups what participants said into recurring themes."
  - Journey Mapper: "Maps the themes onto journey stages, showing how people felt at each one and where they struggled."
  - Patient Safety Reviewer: "Checks each journey stage for patient-safety risks and lists them for someone to approve or dismiss."
  - UX Coach: "Turns each approved safety flag into concrete design recommendations."

## Suggested implementation order
1. Tokens and fonts → 2. Canvas background and group frames → 3. Shared node shell (header, status pill, ports, footer, empty state) → 4. Connector styling and handle position → 5. Participant nodes → 6. Insight Weaver → 7. Journey chart and list → 8. Safety review → 9. UX Coach.

## Files
- `Research Canvas Restyle.dc.html`: the design reference. Open it in a browser with `support.js` alongside. Its Tweaks switch between "Results" and "Not run yet", and between "Excerpt" and "Full text" transcripts. Theme rows, stages, flags and coach cards are clickable.
- `support.js`: the runtime needed to open the reference file. It is not part of the implementation.
- `before.png`: the previous design, for comparison.
