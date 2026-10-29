---
name: design-report
description: Draft a neat, friendly design-update status report from the XOXONA design board for the user to review before posting to Slack. Use whenever the user asks to draft, write, or prepare their design update, design report, status update, or #xoxona-designer post — e.g. "draft my design update", "write up my design report", "prepare my XOXONA update", "what should I post to the designer channel". Reads the design board, diffs against the last posted update, and hands back a draft. Never posts to Slack on its own.
---

# Design report

You are drafting a design-update status report for the user to review before they post it. Follow these steps in order. **Never post anything to Slack yourself** — your only job is to hand the user a finished draft that they read, edit, and send themselves.

## 1. Read the design board

- Use the Claude Design connector (List artifacts / Read artifact) to open the **XOXONA** design board.
- If the board is NOT reachable from this session, STOP and tell the user plainly: "I can't see the XOXONA design board from here — run this where the Claude Design connector is connected, or paste the recent frame changes and I'll format them." Do not invent or guess design details.

## 2. Work out what is actually new

- Read the recent posts in the **#xoxona-designer** Slack channel to find the user's most recent design update(s).
- Compare the board against what has already been reported. Only include things that are genuinely new or changed since the last update — do not repeat anything already covered.
- Group related changes under the feature/area they belong to (e.g. Gift Stage Backdrops, Mascot Lab, Profile photo crop, Prism history in Settings).

## 3. Draft the report — neat, friendly, easy to read

Write it so a teammate can skim it in about 15 seconds and know exactly what changed and where to look. Keep the user's voice, but make it clean and scannable:

- Open with a short, friendly one-line intro of what this update covers.
- For each area: a bold header, a short "where to find it" line (which page/screen in the file), then 1–3 short, plain-language bullets on what changed. No walls of jargon.
- Keep bullets concrete ("new backdrop set per gift tier"), not vague ("updated styling").
- End with a short, friendly sign-off line.

Use this shape (adapt the wording so it sounds like the user, not robotic):

```
*Design update — a few things I've been on* 👇
@[tag the usual people]

Quick rundown of what's changed on the design file 👇
[artifact link]

*✨ [Area name]*
_Where:_ `[page / screen]`
• [what changed]
• [anything added]

*✨ [Area name]*
_Where:_ `[page / screen]`
• [what changed]
```

## 4. Hand it to the user

- Show the full draft in the chat.
- If the user asks to put it in Slack, create it as a **draft** in #xoxona-designer (or wherever they say) so they press send themselves — never send it directly to the channel.
- Flag anything you were unsure about so the user can double-check it before it goes out.
