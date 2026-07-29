---
title: "Why We Chose Local-First Architecture"
date: 2026-07-15
author: Alex Kim
category: design
gradient: 2
icon: layout
excerpt: "Your data should live on your device by default. Here's why we built Drawdy with a local-first architecture — and what that means for you."
---

When we started building Drawdy, we had a fundamental question to answer: where does user data live?

The industry default is clear — put everything in the cloud, require sign-up, sync constantly. It's easier to build, easier to monetize, and easier to lock users in. But it's not better for the people using the tool.

We chose a different path.

## What local-first means

Local-first means your boards, diagrams, and work are stored on your device. Not on our servers. Not behind an account wall. On your machine, where you have full control.

This isn't just a philosophical stance — it has real consequences:

- **Instant startup.** No loading spinners. No "connecting to server." Open the app, and your work is there.
- **Offline by default.** Work on a plane, in a coffee shop with bad wifi, or anywhere else. Your tool shouldn't care about your internet connection.
- **Privacy built in.** We can't see your data because we don't have it. There's nothing to breach, nothing to mine, nothing to sell.
- **You own your data.** Export, backup, move, delete — your files, your choice.

## The technical approach

Under the hood, Drawdy uses a CRDT-based data model. CRDTs (Conflict-free Replicated Data Types) allow multiple copies of the same document to be edited independently and then merged without conflicts.

This is the same technology behind tools like Figma's multiplayer engine and Linear's offline support. The key insight is that you can have both local-first storage *and* real-time collaboration — they're not mutually exclusive.

```javascript
// Simplified: every edit creates a CRDT operation
const operation = {
  type: 'move-node',
  nodeId: 'abc-123',
  position: { x: 200, y: 150 },
  timestamp: Date.now(),
  author: peerId,
};
```

When you choose to sync, these operations merge cleanly with edits from other collaborators. No "last write wins." No data loss.

## Cloud is optional

We're not anti-cloud. Cloud sync is available for teams who want it. But it's opt-in, not the default. You turn it on when you're ready, and you can turn it off whenever you want.

This is the fundamental difference: most tools are cloud-first with an offline mode bolted on. Drawdy is local-first with cloud available when you need it.

## The trade-offs

We won't pretend there aren't trade-offs. Local-first is harder to build. Conflict resolution is genuinely complex. Some features (like real-time cursors) require a network connection by definition.

But we believe the trade-offs are worth it. Your creative tool should work for you, not the other way around.
