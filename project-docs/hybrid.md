# `hybrid_approach.md`

# Hybrid Architecture — Three.js + SVG + React Technical Design Document

Version: 1.0
Status: Architecture RFC / Recommended Production Architecture
Approach Type: Hybrid Rendering System

---

# Table of Contents

1. Executive Summary
2. Why Hybrid
3. Core Philosophy
4. System Architecture
5. Rendering Layers
6. Data Flow
7. Tech Stack
8. Scene Architecture
9. Three.js Layer
10. SVG Layer
11. React UI Layer
12. Scroll Engine
13. Synchronization Engine
14. Coordinate Mapping
15. Animation Pipeline
16. State Management
17. Performance Strategy
18. Mobile Strategy
19. Risks
20. Final Recommendation

---

# 1. Executive Summary

This document defines a hybrid architecture combining:

* [Three.js](https://threejs.org?utm_source=chatgpt.com) for 3D rendering
* SVG for circuit path precision
* React for UI and orchestration

The goal is to build a processor-chip website where:

* processor exists in 3D
* circuit traces animate precisely
* current flows with scroll
* nodes unlock content sections

This architecture solves the biggest problem of pure SVG and pure 3D systems:

### Pure SVG problem

Looks flat.

### Pure 3D problem

Path animation is hard.

Hybrid gives best of both.

---

# 2. Why Hybrid

Your website requires two fundamentally different rendering paradigms.

---

## Problem A — Environment Rendering

Need:

* processor body
* metallic surface
* depth
* lighting
* camera movement
* reflections

Best tool:

Three.js

---

## Problem B — Circuit Logic Rendering

Need:

* exact wire paths
* deterministic pulse movement
* node triggers
* circuit routing

Best tool:

SVG

---

## Problem C — Content Rendering

Need:

* forms
* text
* cards
* buttons

Best tool:

React DOM

---

# 3. Core Philosophy

The system follows one rule:

> Each technology should only do what it is best at.

Responsibility split:

| Layer    | Responsibility    |
| -------- | ----------------- |
| Three.js | Visual realism    |
| SVG      | Circuit precision |
| React    | UI / Logic        |

---

# 4. System Architecture

High-level architecture:

```text
Browser
   │
   ├── Three.js Canvas
   ├── SVG Overlay
   └── React UI
```

---

# 5. Rendering Layers

Rendering stack:

```text
Layer 4 → UI Overlay
Layer 3 → SVG Current
Layer 2 → SVG Paths
Layer 1 → Three.js Scene
Background
```

DOM structure:

```html
<div id="app">
   <canvas id="three-layer"></canvas>
   <svg id="svg-layer"></svg>
   <div id="ui-layer"></div>
</div>
```

---

# 6. Data Flow

Single source architecture.

```text
User Scroll
    ↓
Scroll Engine
    ↓
Master Progress Store
 ┌────┼─────┐
 ↓    ↓     ↓
3D   SVG   UI
```

This is critical.

All systems must read from one progress source.

---

# 7. Tech Stack

Framework:

* [Next.js](https://nextjs.org?utm_source=chatgpt.com)

UI:

* React

3D:

* [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction?utm_source=chatgpt.com)

Animation:

* [GSAP](https://gsap.com?utm_source=chatgpt.com)

State:

* [Zustand](https://zustand-demo.pmnd.rs/?utm_source=chatgpt.com)

Optional:

* GLSL shaders
* Postprocessing bloom

---

# 8. Scene Architecture

Three.js scene graph:

```text
Scene
 ├── ChipBase
 ├── Transistors
 ├── DecorativeComponents
 ├── Lights
 └── CameraRig
```

SVG graph:

```text
SVG
 ├── Paths
 ├── Nodes
 └── Current Pulses
```

React tree:

```text
App
 ├── Scene
 ├── SVGOverlay
 └── Panels
```

---

# 9. Three.js Layer

Three.js handles 3D immersion.

Responsibilities:

* chip geometry
* materials
* lighting
* camera movement
* bloom effects

---

## Chip Geometry

Model in:

* [Blender](https://www.blender.org?utm_source=chatgpt.com)

Export:

* glTF
* compressed mesh

Recommended geometry:

```text
Chip Base
 ├── substrate
 ├── raised components
 ├── metallic borders
 └── sockets
```

---

## Materials

Use physically based rendering.

Recommended material:

```ts
MeshStandardMaterial
```

Properties:

* metalness
* roughness
* emissive intensity

---

## Lighting

Use multiple lights.

Scene lights:

* Ambient light
* Directional light
* Accent point lights

Optional:

Bloom postprocessing.

---

# 10. SVG Layer

SVG overlays precise circuits.

Responsibilities:

* wire routing
* current movement
* node activation

---

## SVG Structure

```svg
<svg>
 <g id="paths"></g>
 <g id="nodes"></g>
 <g id="pulses"></g>
</svg>
```

---

## Path Metadata

Each path requires metadata.

```ts
interface CircuitPath {
  id: string
  length: number
  targetNode: string
}
```

---

## Current Flow

Current visualization:

1. path glow
2. pulse packet
3. bloom

Methods:

* stroke dash animation
* particles
* hybrid

Recommended:

Hybrid.

---

# 11. React UI Layer

React handles user-facing content.

Responsibilities:

* panels
* forms
* CTA buttons
* event cards

Example:

```tsx
<AboutPanel />
<EventsPanel />
<ContactPanel />
```

Panels are HTML overlays.

---

# 12. Scroll Engine

Scroll is the main input.

Formula:

```ts
progress = scrollY / totalScrollableHeight
```

Range:

```text
0 → 1
```

Example:

| Progress | Section |
| -------- | ------- |
| 0.0–0.2  | Boot    |
| 0.2–0.4  | About   |
| 0.4–0.6  | Events  |
| 0.6–0.8  | Team    |
| 0.8–1    | Contact |

---

## Smooth Progress

Use interpolation.

```ts
displayProgress +=
(target - displayProgress) * 0.08
```

This prevents jitter.

---

# 13. Synchronization Engine

Hybrid systems fail if layers desync.

Need synchronization manager.

Responsibilities:

* sync camera
* sync SVG paths
* sync UI panels

---

## Master Progress

Store:

```ts
masterProgress
```

Everything derives from it.

Example:

```text
Scroll 42%
```

Then:

* camera moves 42%
* current travels 42%
* section threshold checked

---

# 14. Coordinate Mapping

Hardest engineering problem.

Three.js uses:

3D coordinates.

SVG uses:

2D coordinates.

Must align.

---

## Method 1 — Static Camera

Simplest.

Keep camera mostly fixed.

Pros:

* easy SVG alignment

Cons:

* less cinematic

---

## Method 2 — Projection Mapping

Convert 3D point to 2D screen coordinates.

Example:

```ts
vector.project(camera)
```

Transforms:

```text
3D → Screen Space
```

Then position SVG node.

Recommended for production.

---

# 15. Animation Pipeline

Complete animation flow:

---

## Boot Sequence

Three.js:

* processor powers on

SVG:

* core trace glows

UI:

* logo appears

---

## Section Activation Sequence

Example:

About section.

---

### Step 1

Scroll reaches threshold.

---

### Step 2

Camera pans.

---

### Step 3

Current flows to node.

---

### Step 4

Node charges.

---

### Step 5

Panel expands.

---

# 16. State Management

Centralized state required.

Store interface:

```ts
interface SceneState {
  progress: number
  activeSection: string | null
  activeNode: string | null
}
```

Actions:

```ts
setProgress()
setActiveNode()
setSection()
```

---

# 17. Render Loop

Three.js render loop:

```ts
function animate() {
 requestAnimationFrame(animate)
 renderer.render(scene, camera)
}
```

SVG:

Update only when progress changes.

React:

Render only when section changes.

Important optimization.

---

# 18. Performance Strategy

Performance targets:

Desktop:
60 FPS

Mobile:
30–60 FPS

---

## Bottlenecks

Possible bottlenecks:

* bloom
* heavy meshes
* filters
* too many particles
* React rerenders

---

## Optimizations

### Three.js

Use:

* instancing
* compressed meshes
* reduced draw calls

Target:

```text
< 300 draw calls
```

---

### SVG

Keep:

```text
< 1000 elements
```

Avoid expensive blur filters.

---

### React

Use:

* memoization
* lazy loading
* Suspense

---

# 19. Mobile Strategy

Mobile devices are weaker.

Need adaptive quality.

---

## Mobile Downgrades

Disable:

* bloom
* extra particles
* excessive camera movement

Reduce:

* polygon count
* SVG complexity

---

## Layout Simplification

Desktop:

Radial chip.

Mobile:

Semi-linear chip.

---

# 20. Accessibility

Support:

* keyboard navigation
* screen readers
* reduced motion mode

Use:

```css
@media (prefers-reduced-motion: reduce)
```

Disable intense animations when needed.

---

# 21. Project Structure

Recommended structure:

```text
src/
 ├── components/
 │   ├── three/
 │   ├── svg/
 │   └── ui/
 │
 ├── shaders/
 ├── store/
 ├── hooks/
 └── utils/
```

Detailed:

```text
components/
 ├── three/
 │    ├── ChipScene.tsx
 │    ├── CameraRig.tsx
 │    └── Lights.tsx
 │
 ├── svg/
 │    ├── CircuitOverlay.tsx
 │    ├── PathAnimator.tsx
 │    └── NodeLayer.tsx
 │
 └── ui/
      ├── About.tsx
      ├── Events.tsx
      └── Contact.tsx
```

---

# 22. Risks

---

## Risk 1 — Coordinate Sync

Biggest risk.

Hardest part.

---

## Risk 2 — Complexity

Hybrid adds engineering overhead.

---

## Risk 3 — Mobile Performance

Need adaptive quality.

---

# 23. Complexity Estimate

| Area     | Difficulty |
| -------- | ---------- |
| Three.js | High       |
| SVG      | Medium     |
| Sync     | Very High  |
| UI       | Medium     |

Overall:

**High Complexity**

---

# 24. Development Roadmap

---

## Phase 1 — Wireframe

* chip topology
* section layout

Duration:
1 week

---

## Phase 2 — Asset Creation

* 3D chip
* SVG paths

Duration:
2 weeks

---

## Phase 3 — Core Engineering

* scroll engine
* sync engine

Duration:
3–5 weeks

---

## Phase 4 — UI Integration

Duration:
1–2 weeks

---

## Phase 5 — Optimization

Duration:
1–2 weeks

---

# 25. Final Technical Evaluation

| Factor          | Score  |
| --------------- | ------ |
| Visual Quality  | 10/10  |
| Path Control    | 10/10  |
| Maintainability | 8.5/10 |
| Complexity      | 5/10   |
| Performance     | 8/10   |
| Wow Factor      | 10/10  |

---

# 26. Final Recommendation

For your processor-chip website:

Pure SVG:

* easiest
* maintainable

Pure Three.js:

* beautiful
* difficult

Hybrid:

* best overall

---

# Final Verdict

Hybrid architecture is recommended when you want:

✅ premium cinematic visuals
✅ precise current movement
✅ strong storytelling
✅ flagship experience

Not ideal if:

❌ fast MVP required
❌ small team
❌ limited graphics expertise

---

**Hybrid Approach Final Score for This Project: 9.7/10**
