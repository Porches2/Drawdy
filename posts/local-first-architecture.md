---
title: "Fast + Optimized Board"
date: 2026-07-15
author: Alex Kim
category: product
gradient: 2
icon: layout
slug: fast-optimized-board
excerpt: "Speed isn't a feature — it's the foundation. Here's how Drawdy stays fast with thousands of elements on the canvas."
---

A whiteboard that lags is a whiteboard you stop using. When you're deep in a system diagram with hundreds of nodes, connections, and annotations, the last thing you need is a tool fighting your momentum.

Drawdy is built to stay fast — not just on demo boards with 20 sticky notes, but on real-world canvases with thousands of elements.

## Why speed matters more than features

Every tool demo looks smooth. The real test is six months in, when your board has 2,000 nodes, 500 connections, and a dozen embedded images. Most whiteboard tools start choking at that scale. Frame drops, input lag, sluggish zoom — death by a thousand cuts.

We treat performance as a constraint, not a feature. Every new capability has to pass one test: does the board still feel instant?

## How we keep it fast

### Spatial indexing

Not every element needs to be processed every frame. Drawdy uses a spatial index (R-tree) to track what's on screen and only renders what's visible. Pan across a massive board and the engine is only touching the elements in your viewport.

```javascript
// Only process elements in the current viewport
const visible = spatialIndex.search({
  minX: viewport.x,
  minY: viewport.y,
  maxX: viewport.x + viewport.width,
  maxY: viewport.y + viewport.height,
});
```

### Canvas rendering, not DOM

Each element isn't a DOM node. Drawdy renders to `<canvas>`, which means the browser isn't managing thousands of individual HTML elements. The result: consistent 60fps regardless of board complexity.

DOM-based whiteboards hit a wall around 500–1,000 elements. Canvas-based rendering pushes that ceiling to tens of thousands.

### Incremental updates

When you move a node, we don't re-render the entire board. Only the affected region gets redrawn. This "dirty rectangle" approach means the cost of an interaction is proportional to what changed, not the total size of the board.

### Off-thread processing

Heavy operations — layout calculations, export rendering, search indexing — run in Web Workers. The main thread stays free for input handling and rendering, so the board never freezes while something expensive happens in the background.

## The numbers

On a board with 5,000 elements:

- **Input latency:** < 8ms (pen-to-screen)
- **Pan/zoom:** 60fps sustained
- **Cold open:** < 400ms to interactive
- **Memory:** ~120MB (vs 400MB+ for DOM-based alternatives)

These aren't cherry-picked benchmarks. They're from real boards created by our beta users.

## Optimization is ongoing

Performance work is never done. We profile regularly, catch regressions in CI, and treat any frame drop as a bug worth investigating. The board should feel like a direct extension of your thinking — and that means zero friction between intent and result.
