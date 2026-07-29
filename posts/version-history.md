---
title: "Version History and Why It Should Be Free"
date: 2026-06-05
author: Alex Kim
category: product
gradient: 7
icon: clock
excerpt: "Version history shouldn't be a premium feature. Here's why Drawdy includes unlimited version history for everyone — and how we built it."
---

Here's something that frustrates us about modern software: version history is almost always a paid feature. Free users get "last 30 days." Pro users get "unlimited." Enterprise gets "with audit logs."

Version history isn't a luxury feature. It's a safety net. Everyone deserves it.

## Our approach

In Drawdy, every board has full version history. Free. No time limit. No tier gate.

You can:

- **Browse snapshots.** See how your board looked at any point in time.
- **Restore previous versions.** Made a mistake? Go back. No questions asked.
- **Fork from history.** Want to explore a different direction from an earlier state? Fork it into a new board.
- **See who changed what.** In collaborative boards, each change is attributed to its author.

## How it works technically

Since Drawdy is local-first, version history is stored on your device alongside your board data. Every edit creates a CRDT operation, and we periodically snapshot the full document state.

```javascript
// Snapshots are compressed and stored locally
const snapshot = {
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  state: Y.encodeStateAsUpdate(ydoc),
  label: null, // user can add labels like "before refactor"
};
```

Snapshots are compressed using a binary diff against the previous snapshot. For a typical board, a month of active editing produces around 2-5 MB of history data. Manageable even on modest devices.

## Why other tools charge for it

The honest answer: because they can. When your data lives on someone else's server, storage costs money, and version history is an easy feature to gate behind a paywall.

Local-first changes this equation. Your storage is your storage. There's no incremental cost to us when you keep more history. So we don't charge for it.

## What about cloud sync?

When you enable cloud sync, your version history syncs too. We store snapshots encrypted on our sync servers. This is the one area where storage costs apply to us — but we've decided to absorb it rather than pass it to users.

We may revisit this at extreme scale (thousands of boards with years of history), but for now, it's unlimited and free.

## The bigger principle

Version history is just one example of a broader philosophy: features that protect user work should never be paywalled. Undo, backup, export, version history — these are safety nets, not upsells.

We'll charge for genuinely premium features: advanced collaboration, team management, custom integrations. But we'll never charge you to undo a mistake.
