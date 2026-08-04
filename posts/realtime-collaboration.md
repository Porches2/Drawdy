---
title: "Real-Time Collaboration Without Compromise"
date: 2026-07-08
author: Alex Kim
category: product
gradient: 3
icon: users
excerpt: "How we built multiplayer collaboration on top of a local-first architecture — without sacrificing speed or privacy."
---

One of the most common questions we get: "If Drawdy is local-first, how does collaboration work?"

It's a fair question. Local-first and real-time multiplayer sound like they're at odds. But with the right architecture, they complement each other.

## The problem with traditional collaboration

Most collaborative tools work like this: your edits go to a server, the server is the source of truth, and other users get updates from the server. This is simple to build but has real downsides:

- **Latency.** Every keystroke round-trips to a server. On a good connection, you don't notice. On a bad one, the tool feels sluggish.
- **Single point of failure.** Server goes down? Nobody can work.
- **Privacy cost.** The server sees everything. Every edit, every deleted draft, every half-formed idea.

## How Drawdy does it differently

Drawdy's collaboration is peer-aware but not server-dependent. Here's how it works:

1. **Every edit is a local operation first.** Your changes apply instantly to your local state. There's zero latency for your own edits.
2. **Operations sync via CRDTs.** When connected, your edits propagate to collaborators. CRDTs ensure that edits merge deterministically — no conflicts, no data loss.
3. **The sync layer is pluggable.** By default, we provide a lightweight relay server for real-time sync. But the architecture supports any transport — WebSocket, WebRTC peer-to-peer, even sneakernet via file export.

## What you get

- **Live cursors and presence.** See where your collaborators are on the canvas in real time.
- **Instant local edits.** Your actions are never blocked by network latency.
- **Offline resilience.** If you lose connection mid-session, keep working. Changes merge when you reconnect.
- **Selective sharing.** Share a single board without giving access to your entire workspace.

## The technical details

Our sync protocol is built on top of Yjs, a battle-tested CRDT implementation. Each board is a Y.Doc that can be synced across peers.

```javascript
// Connect to a room for collaborative editing
const provider = new WebsocketProvider(
  'wss://sync.drawdy.app',
  boardId,
  ydoc
);

// Awareness protocol for live cursors
provider.awareness.setLocalState({
  cursor: { x: 100, y: 200 },
  user: { name: 'Alex', color: '#CDFF00' },
});
```

The relay server never stores your document content — it only forwards encrypted operations between connected peers. When all peers disconnect, there's nothing on the server.

## What's next

We're working on commenting, board-level permissions, and guest access links. Collaboration isn't just about seeing each other's cursors — it's about having conversations in context. That's the part we're building toward.
