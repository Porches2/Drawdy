---
title: "Hand-Drawn UI: The Design Philosophy Behind Drawdy"
date: 2026-06-14
author: Alex Kim
category: design
gradient: 6
icon: pen
excerpt: "Why Drawdy looks sketchy on purpose — and how hand-drawn aesthetics change the way people think and collaborate."
---

Drawdy looks hand-drawn. Lines wobble slightly. Shapes aren't perfectly geometric. Text has a casual, almost notebook-like quality.

This is intentional. Every pixel of it.

## The problem with polish

Most productivity tools optimize for one thing: looking professional. Clean lines, precise alignment, pixel-perfect rendering. And for final deliverables, that's exactly right.

But for *thinking*? Polish is the enemy.

When a tool looks too finished, people treat their work as finished. They stop exploring. They optimize a single idea instead of generating ten. The tool's aesthetics create a psychological barrier to iteration.

## Why sketchy works

Hand-drawn aesthetics do something subtle but powerful: they signal that this is *work in progress*. That it's safe to change, rearrange, delete, and start over.

Research in design cognition backs this up. Studies by Suwa and Tversky found that sketchy representations encourage "re-interpretation" — looking at the same drawing and seeing new possibilities. Polished representations lock in interpretation.

In practice, this means:

- **People contribute more freely.** A sketchy diagram feels like a conversation starter, not a finished artifact. Collaborators are more likely to suggest changes.
- **Ideas stay fluid longer.** When everything looks like a draft, there's no pressure to commit too early.
- **Focus shifts to structure.** Without pixel-perfect aesthetics demanding attention, people focus on relationships, flows, and architecture — the things that matter.

## How we implement it

The hand-drawn look isn't random noise applied to clean shapes. It's a deliberate rendering approach:

- **Stroke variation.** Line width varies slightly along each path, simulating pen pressure.
- **Controlled wobble.** Paths deviate from their mathematical ideal by a small, consistent amount. Too little and it looks sterile; too much and it looks broken.
- **Consistent inconsistency.** The same shape drawn twice looks slightly different each time, but the overall style stays cohesive.

We use a custom rendering pipeline built on top of Canvas 2D and SVG. Each shape type has its own "sketchiness" parameters tuned to feel natural.

## Not for everything

Hand-drawn doesn't mean sloppy. When you export a diagram for a presentation or documentation, Drawdy offers a clean rendering mode. The structure is the same — only the aesthetics change.

The sketchy canvas is for thinking. The clean export is for communicating. Both matter, and each has its place.

## Inspiration

We're inspired by tools like Excalidraw (which pioneered this aesthetic in web whiteboards), Balsamiq (which brought sketchy wireframes to product design), and the work of Bill Buxton on sketching in user experience design.

But our aspiration goes beyond aesthetics. We want Drawdy to feel like the best notebook you've ever had — one that's infinite, structured, and collaborative.
