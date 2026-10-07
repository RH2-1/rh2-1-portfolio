# webdesign1 — a scroll-driven 3D narrative

A one-page site where scrolling drives a WebGL scene through five chapters. Built on
Next.js 16 + three.js, with **two runtime dependencies total**.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the build
npm run lint
```

## The stack, and why it is this small

| Dependency | Version | Role |
|---|---|---|
| `three` | 0.186.1 | Renderer, GLB loading, animation, post-processing, shaders |
| `@types/three` | 0.186.0 | TypeScript types (**required** — `three` ships none) |

Everything else is deliberately absent. `three/addons/` already provides GLB loading,
skinned animation, HDR loading and post-processing; scroll timing is arithmetic on
`window.scrollY` plus damped interpolation; smooth scrolling is a CSS property. Extra
libraries were evaluated and rejected — see *Alternatives* below.

## Architecture

```
src/
  app/
    layout.tsx      Geist fonts, metadata, <html data-scroll-behavior="smooth">
    page.tsx        Composes Scene + Narrative + Credits (a Server Component)
    globals.css     Tailwind v4 theme, native smooth scroll
  components/
    Scene.tsx       'use client'. The only browser-dependent component.
    Narrative.tsx   The chapter copy. A Server Component — renders without JS.
    Credits.tsx     Licence attribution (a requirement, not decoration).
  lib/
    narrative.ts    ← EDIT THIS to rewrite the story. Chapters + camera beats.
    scene.ts        Renderer, camera rig, subjects, frame loop, teardown.
    sky.ts          Gradient sky shader; also the scene's environment light.
    displacement.ts Noise-based vertex displacement for the procedural subject.
```

### How scroll becomes a story

There is exactly **one** piece of state: `progress` in `[0, 1]`, read from
`window.scrollY / (documentHeight − viewportHeight)`. Every chapter is `h-screen`, so
progress maps linearly onto chapter index by construction — add chapters and the
timeline lengthens with no other change.

`narrative.ts` holds `CHAPTERS` (the copy) and `BEATS` (camera position, look target,
field of view, exposure, sky palette). One beat per chapter. The camera **interpolates
between adjacent beats** with a smoothstep rather than easing toward a target, so
scrolling backwards retraces the shot exactly instead of lagging.

Adding a chapter: add one entry to each array, same order. A dev-only warning fires if
the lengths diverge.

### The three subjects

1. **Procedural sphere** (`displacement.ts`) — an icosahedron with a 3D simplex-noise
   displacement injected into the standard PBR vertex shader via `onBeforeCompile`. The
   noise is inlined GLSL, so no noise library is needed. This subject needs no asset and
   therefore cannot fail to load.
2. **Animated hero** — `public/models/Fox.glb`, rigged and animated, playing its `Walk`
   clip through an `AnimationMixer`.
3. **Monoliths + splinters + stage rings** — procedural geometry giving depth and scale.

The procedural subject **dissolves** (opacity, depth-write and visibility) as the camera
commits to the hero, so the two never occupy the frame at once.

### Three non-obvious things this code depends on

- **Runtime re-fitting instead of hardcoded scales.** `fitToHeight()` measures each
  loaded model's bounding box and rescales it to a target height. This is not
  over-engineering: the bundled models disagree about units by two orders of magnitude
  (`barrel.glb` is 0.2 units tall; the raw Fox geometry is 154). Hardcoded scales break
  the moment a model is swapped.
- **`PCFSoftShadowMap` no longer exists.** The constant is still exported by three 0.186,
  but its implementation was removed — setting it logs a warning and silently falls back.
  The code uses `PCFShadowMap` explicitly.
- **A custom `ShaderMaterial` must opt into tone mapping and colour space.** `sky.ts`
  includes `<tonemapping_fragment>` and `<colorspace_fragment>` manually. Without them
  the sky reads darker and more saturated than every lit surface in front of it.

### WebGL and prerendering

Client Components are still prerendered during `next build`, so the scene must not run
at build time. Two safeguards:

- The scene is **dynamically imported** only after an `IntersectionObserver` fires, so
  three.js is not in the initial page payload (verified: the 632 KB chunk is absent from
  the prerendered HTML's script tags).
- WebGL support is probed before mounting; without it the narrative text renders
  normally and the canvas is never created.

`Scene.tsx` exposes `data-scene-status` and `data-scene-assets` on its container for
automated checks.

## Assets

14 files, 6.41 MiB, in `public/models/` and `public/hdr/`. Every URL was HTTP-checked and
every file checksummed; `ASSETS.md` is the authoritative manifest with source URLs,
licences, and SHA-256 checksums.

**Only one file is used by the page:** `Fox.glb`. It is CC0 for the mesh but **CC-BY-4.0
on its rigging, animation and glTF conversion**, so the credit in `Credits.tsx` is a
licence condition. Everything else is CC0 and unused but available.

Two assets were deliberately rejected on evidence: `Sponza.glb` **404s** and is
CRYENGINE-licensed (not redistributable), and `DamagedHelmet.glb` carries a CC-BY-**NC**
upstream that makes it unsuitable for commercial work.

### Swapping in a real HDRI

Three CC0 HDRIs are already on disk. In `scene.ts`, replace the PMREM-from-sky block:

```ts
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
const pmrem = new THREE.PMREMGenerator(renderer);
const hdr = await new RGBELoader().loadAsync("/hdr/venice_sunset_1k.hdr");
scene.environment = pmrem.fromEquirectangular(hdr).texture;
```

Trade-off: a real HDRI is more physically accurate but is fixed at load time. The shader
sky is what lets each chapter re-tint the lighting.

### Compressing models

Not needed yet (the largest model is 464 KB). If you add heavier assets:

```bash
npx --yes @gltf-transform/cli@4.5.1 optimize in.glb out.glb --compress meshopt
```

Meshopt is the lower-risk default; Draco gives marginally smaller files but requires a
WASM decoder hosted client-side.

## Accessibility and performance

- `prefers-reduced-motion` is honoured: camera damping is bypassed and CSS smooth scroll
  is disabled, so the scene snaps to the reader's scroll position.
- The canvas is `aria-hidden` and `pointer-events-none`; all content is real DOM text.
- The render loop early-returns while the tab is hidden.
- Device pixel ratio is capped at 2.
- Teardown disposes every geometry, material, texture and the GL context itself — the
  teardown walks loaded models explicitly, because removing a node from the graph does
  not free its GPU buffers.

## Alternatives considered and rejected

| Package | Why not |
|---|---|
| `@react-three/fiber` + `drei` | Declarative React wrapper. Pleasant, but the imperative API is ~30 lines here and this keeps the dependency count at two. Adding it later is a one-line install. |
| `gsap` / `lenis` / `zustand` | Scroll timing, smooth scroll and a single-number state need no library. |
| `@theatre/r3f` | Hard `ERESOLVE` failure: its R3F peer is `^8.13.6`, incompatible with v9. |
| `glsl-noise` | Tarball contains raw `.glsl` files and no `index.js`, despite its `main` field. The noise is inlined instead. |
| `@studio-freight/lenis` | Deprecated; renamed to `lenis`. |

## Notes on this Next.js version

Next 16 has breaking changes that matter here, all verified against the bundled docs
(`node_modules/next/dist/docs/`); `nextjs16-conventions.md` is the full report.

- **Turbopack is the default** for `dev` *and* `build`. `--turbopack` must **not** be
  added to scripts, and a custom `webpack` config would make `build` fail.
- **`next lint` was removed**; linting is `eslint` via the `lint` script.
- **`scroll-behavior: smooth` is no longer applied automatically** on navigation, which
  is why `<html>` carries `data-scroll-behavior="smooth"`.
- `ssr: false` in `next/dynamic` still works, but **only inside Client Components**.
- `params` / `searchParams` are Promises.

## Verification performed

- `npx tsc --noEmit`, `npm run lint`, `npm run build` — all clean.
- Headless Chromium (real WebGL via SwiftShader) at five scroll positions:
  scene `ready`, assets `1/1`, GL context never lost, **0 console errors, 0 failed
  requests, 0 warnings**.
- Confirmed the three.js chunk is code-split out of the initial payload.
