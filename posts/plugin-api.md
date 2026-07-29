---
title: "Building a Plugin API for the Canvas"
date: 2026-06-22
author: Alex Kim
category: product
gradient: 5
icon: code
excerpt: "Drawdy's plugin API lets you extend the canvas with custom nodes, integrations, and workflows. Here's our approach to building an extensible platform."
---

One of our core beliefs: the best tools are platforms. They give you building blocks and let you assemble them in ways the original creators never imagined.

That's why Drawdy ships with a plugin API from the start.

## What plugins can do

Plugins can extend Drawdy in several ways:

- **Custom node types.** Create nodes that render custom content — code snippets, live data, embedded previews, whatever your workflow needs.
- **Canvas actions.** Add new tools to the toolbar, register keyboard shortcuts, automate repetitive tasks.
- **Data integrations.** Pull data from external sources (APIs, databases, files) and display it on the canvas.
- **Export formats.** Generate custom outputs from your board — Mermaid diagrams, architecture docs, dependency graphs.

## The API design

We followed three principles:

### 1. Declarative over imperative

Plugins describe *what* they provide, not *how* the canvas should render it. This keeps the API stable even as the canvas internals evolve.

```javascript
export default {
  name: 'code-block',
  version: '1.0.0',

  nodes: [{
    type: 'code-block',
    label: 'Code Block',
    icon: 'code',
    defaultProps: {
      language: 'javascript',
      code: '// write code here',
    },
    render: (props) => `
      <pre><code class="language-${props.language}">
        ${props.code}
      </code></pre>
    `,
  }],
};
```

### 2. Sandboxed execution

Plugins run in a sandboxed environment. They can't access the filesystem, make arbitrary network requests, or modify other plugins' data. This is important for security — users should be able to install plugins without worry.

### 3. Hot-reloadable

During development, plugins reload instantly when you save. No restart, no rebuild. This makes the development loop fast enough that building plugins feels natural, not burdensome.

## Built-in plugins

Drawdy ships with several built-in plugins that use the same API as third-party plugins:

- **Architecture nodes** — Service, database, API gateway node types with connector lines
- **Sticky notes** — Classic sticky notes with color coding
- **Markdown notes** — Rich text editing in a canvas node
- **Image embed** — Drag-and-drop images onto the canvas

These serve as both useful defaults and reference implementations for plugin authors.

## What's coming

We're working on a plugin registry — a place to discover, install, and share community plugins. Think npm for canvas extensions.

If you're interested in building plugins, reach out. We're looking for early partners to shape the API before we freeze it for v1.
