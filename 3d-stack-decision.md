# 3D + Scroll-Storytelling Stack Decision — `webdesign1`

**Scope:** Determine the exact set of 3D / scroll-storytelling / asset-pipeline packages to install into
`/home/arthur/bin/webdesign1` (Next.js 16.3.8, React 19.2.8, TypeScript, Tailwind v4), with real published
versions and install feasibility verified against the live npm registry.

**Method:** All version numbers, peer ranges, and module-format facts below are copied from live command
output (`npm view`, registry JSON, jsdelivr/unpkg file listings) executed 2026-10-06. Install feasibility
was tested with `npm install --dry-run` in throwaway directories under `/tmp/stackcheck/` — nothing was
installed, and `package.json` / `package-lock.json` in the workspace were not touched. Web claims cite the
URL and the quoted text actually fetched on 2026-10-06.

**Environment (verified):**

- Project root: `/home/arthur/bin/webdesign1` — deps are exactly `next@16.3.8`, `react@19.2.8`, `react-dom@19.2.8` (read from `package.json`).
- Node `v24.20.0`, npm `11.19.0`, registry `https://registry.npmjs.org/`.
- Anchor re-check: `npm view react@19.2.8 version` → `19.2.8`; `npm view react-dom@19.2.8 version` → `19.2.8`; `npm view next@16.3.8 version` → `16.3.8`. All pins exist.

---

## 1. Inventory — every candidate, queried live on 2026-10-06

### 1a. React-three stack

| Package | Latest version (published) | React 19 support (peer range, verbatim) | ESM | Notes for a Next.js app |
|---|---|---|---|---|
| `three` | **0.186.1** (2026-09-24) | n/a — no peer deps (framework-agnostic) | Dual: `exports."."` = `import ./build/three.module.js` / `require ./build/three.cjs`; `type: module` | **Ships no TypeScript types**: package has no `types`/`typings` field; tarball flat listing = 1,263 files, **0** `.d.ts`. `@types/three` is mandatory. Exports `three/addons/*`, `three/webgpu`, `three/tsl`. |
| `@types/three` | **0.186.0** (2026-09-11) | n/a | Types-only | Covers core + addons: 964 files incl. `examples/jsm/**/*.d.ts` (e.g. `examples/jsm/Addons.d.ts`). Own deps: `fflate ~0.8.3`, `@types/webxr >=0.5.17`, `meshoptimizer ~1.1.1`, `@types/stats.js *`, `@tweenjs/tween.js ~23.1.3`, `@dimforge/rapier3d-compat ~0.12.0`. |
| `@react-three/fiber` | **9.8.1** (2026-09-24) | **`react: ">=19 <19.4"`, `react-dom: ">=19 <19.4"`** ✔ (19.2.8 in range) | Dual: `main` `dist/react-three-fiber.cjs.js`, `module` `dist/react-three-fiber.esm.js` | Also peers `three >=0.156`. `expo`, `expo-gl`, `expo-asset`, `react-native`, `expo-file-system` peers are **optional** (`peerDependenciesMeta`) → no RN bloat on a Next install. `dist-tags`: latest 9.8.1 / next-major alpha 10.0.0-alpha.5. |
| `@react-three/drei` | **10.7.9** (2026-09-25) | **`react: "^19"`, `react-dom: "^19"` (react-dom optional)** ✔ | Dual: `main` `index.cjs.js`, `module` `index.js` | Peers `three >=0.159`, `@react-three/fiber ^9.0.0`. Brings `maath ^0.10.8`, `camera-controls ^3.1.0`, `glsl-noise ^0.0.0`, `three-stdlib ^2.35.6` as transitive deps. |
| `@react-three/postprocessing` | **3.1.3** (2026-09-27) | **`react: "^19.0.0"`** ✔ | **ESM-only** (`type: module`, single export `./dist/index.js`, no `require` path) | Peers `three >=0.156.0`, `postprocessing ^6.36.0`, `@react-three/fiber >=9.7.0`. |
| `postprocessing` (core engine, required by the wrapper) | **6.39.5** (2026-09-09) | n/a | Dual: `import` `build/index.js` / `require` `build/index.cjs` | Peer `three >=0.168.0 <0.187.0` → three 0.186.1 is in range. npm 11 **auto-installs** it as a peer when you add `@react-three/postprocessing` (verified in dry-run). |
| `@react-three/rapier` | **2.2.0** (2025-11-03) | **`react: "^19"`** ✔ | Dual: `main` `dist/react-three-rapier.cjs.js`, `module` `dist/react-three-rapier.esm.js` | Peers `three >=0.159.0`, `@react-three/fiber ^9.0.4`. Bundles `@dimforge/rapier3d-compat 0.19.2` (WASM shipped inside the dep, no separate wasm hosting step). |
| `@react-three/cannon` | **6.6.0** (2023-08-17) | `react: ">=18"` — inclusive but never updated for v19 era | Not inspected | Peers `@react-three/fiber ">=8"`, `three ">=0.139"`. Last real release **2023**; superseded by rapier. → skip bucket. |
| `@react-three/offscreen` | **0.0.8** stable; `1.0.0-rc.1` (2025-01-30) on `rc` tag | `react: ">=18"` — no explicit 19 claim | Dual: `exports` `import ./dist/index.mjs` / `require ./dist/index.js` | Peers `@react-three/fiber >=8.0.0`. React 19 status unverified; complexity high. |
| `leva` | **0.10.1** (2025-10-31) | **`react: "^18.0.0 \|\| ^19.0.0"`** ✔ | No `type` field (not ESM-only) | Debug panel; internal dep `zustand ^3.6.9` (nested, no conflict). Dev-tooling nature → nice-to-have. |

### 1b. Animation / scroll

| Package | Latest version (published) | React 19 support | ESM | Notes |
|---|---|---|---|---|
| `gsap` | **3.15.0** (2026-04-13) | n/a — no React peer | Dual via `exports` (`import ./index.js` / `require ./dist/gsap.js`) | Zero deps. **All bonus plugins ship in the free public tarball** (verified in file listing: `ScrollTrigger`, `SplitText`, `ScrollSmoother`, `Flip`, `Observer`, `DrawSVG`, `MorphSVG`, `GSDevTools`, `InertiaPlugin`, `CustomEase`, `MotionPathPlugin`; 179 files total). License field: `Standard 'no charge' license`. |
| `@gsap/react` | **2.1.2** | `react: ">=17"` (includes 19) | Not inspected | Peers `gsap ^3.12.5`. The official `useGSAP()` hook — small helper, no reason to hand-roll. |
| `lenis` | **1.3.26** (2026-08-05) | `react: ">=17.0.0"` — **optional** peer | **ESM-only** (`type: module`; `exports` default `./dist/lenis.mjs`, no `require`) | Has a first-party `./react` subpath → `dist/lenis-react.mjs` (verified). `vue`/`@nuxt/kit` peers optional. |
| `@studio-freight/lenis` | 1.0.42 | — | — | **DEPRECATED** (npm: “has been renamed to 'lenis'”). Same for `@studio-freight/react-lenis`. → skip bucket. |
| `motion` (Framer Motion successor) | **14.0.0** (2026-10-02) | **`react: "^18.0.0 \|\| ^19.0.0"` (optional)** ✔ | Dual (`import ./dist/es/*.mjs` / `require ./dist/cjs/*.js`) | Exports subpaths `./react`, `./three` (motion values → three objects/uniforms), `./mini`, `./vgpu`, `./debug`. Depends on `framer-motion 14.0.0` (same-day publish) — the rename is a facade, not a fork. |
| `framer-motion` | **14.0.0** (2026-10-02) | `^18.0.0 \|\| ^19.0.0` | Dual | Still published, **not deprecated** — but new code should import from `motion/react` per the official upgrade guide (quoted in §3). Choose one, not both. |
| `@react-spring/three` | **10.1.2** (2026-06-24) | `react: "^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0"` ✔ | Dual (`main` cjs, `module` legacy-esm) | Peers `three >=0.126`, `@react-three/fiber >=6.0`. ⚠ npm README still says “This package is for version 6 of react-three-fiber” (stale doc); peer range permits v9 but no release note confirmed v9 testing → see §6 unverified. |

### 1c. Shader / maths helpers

| Package | Latest version (published) | React 19 | ESM | Notes |
|---|---|---|---|---|
| `glsl-noise` | **0.0.0** (2022-06-18, unmaintained) | n/a | No (`main: index.js`, no `module`/`exports`/`types`) | ⚠ **Tarball listing = 12 files, all raw `.glsl` + meta — there is NO `index.js` even though `package.json` declares `"main": "index.js"`, and there are no types.** It is a snippet pack; consuming it directly in Next needs you to own the GLSL import mechanism → skip as a direct dep. |
| `maath` | **0.10.8** (2024-07-07) | n/a | Dual (`main` cjs, `module` esm, `types` `dist/maath.cjs.d.ts`) | Peers `three >=0.134.0`, `@types/three >=0.134.0`. Math/geometry helpers (`random`, `damp`, `buffer`). Already a transitive dep of drei. |
| `camera-controls` | **3.1.2** (2025-11-17) | n/a | Dual (`import` module.js / `require` .cjs) | Peer `three >=0.126.1`. Already a transitive dep of drei (`^3.1.0`). |
| `three-custom-shader-material` | **6.4.0** (2025-10-12) | `react: ">=18"` — peer is **optional** | Not fully inspected | Peers `@react-three/fiber >=8` (optional), `three >=0.159`. For extending `MeshStandardMaterial` with custom GLSL. React-19-specific testing not claimed. |

### 1d. Authoring / asset pipeline

| Package | Latest version (published) | React 19 | ESM | Notes |
|---|---|---|---|---|
| `@theatre/core` | **0.7.2** (2024-05-19) | n/a (no React peer) | **CJS** (`type: commonjs`) | Framework-agnostic animation state. 2+ years since last publish; project README says development was **temporarily moved to a private repo** for the 1.0 push. |
| `@theatre/studio` | **0.7.2** (2024-05-19) | n/a | CJS | Peer `@theatre/core *`. License **AGPL-3.0** (design-time only; ship only `@theatre/core`, Apache-2.0). |
| `@theatre/r3f` | **0.7.2** (2024-05-19) | — | — | ⚠ **Provably breaks with r3f v9**: peer `@react-three/fiber ^8.13.6` → `npm install --dry-run` fails with `ERESOLVE` (§4). → skip. |
| `@gltf-transform/core` | **4.5.1** (2026-09-28) | n/a | Dual (`main` cjs, `module` esm) | Node-side asset scripting (`type: module`). |
| `@gltf-transform/cli` | **4.5.1** (2026-09-28) | n/a | ESM (`type: module`) | `engines: node >=20` (Node 24 OK). Bundles its own `sharp ~0.35.3`, `draco3dgltf`, `meshoptimizer`, `gltf-validator`. |
| `sharp` | **0.35.5** (2026-09-27) | n/a | **CJS** (`type: commonjs`) | `engines: node >=20.9.0`. Platform binaries via `optionalDependencies` (`@img/sharp-* 0.35.5`, libvips 1.3.4). Note: also what Next itself expects for image optimization — declaring it explicitly is safe. |
| `vite-plugin-glsl` | 1.6.2 (2026-10-04) | n/a | ESM | Peers are **`vite >=3` / `esbuild >=0.25`** → Vite-only plugin; **does not apply to Next.js**. No Next-equivalent found (see §7 open questions). |

### 1e. Optional

| Package | Latest version (published) | React 19 | ESM | Notes |
|---|---|---|---|---|
| `@splinetool/react-spline` | **4.1.0** (2025-07-15) | `react: "*"` (unconstrained — **no explicit 19 statement**) | ESM-only paths (`exports` has `import` only) | Peers: `@splinetool/runtime *`, `next >=14.2.0` (**optional**). Has a documented `@splinetool/react-spline/next` SSR-placeholder subpath (confirmed in package `exports` and 200 on the dist file). |
| `@splinetool/runtime` | **2.0.71** (2026-10-05) | n/a | Dual (`import` build/runtime.js / `require` build/runtime.cjs) | Actively published (yesterday relative to this report). |
| `zustand` | **5.0.15** (2026-08-13) | `react: ">=18.0.0"` — **optional** peer | Dual (`exports`: esm + cjs) | Already transitive via r3f (`^5.0.3`) and drei (`^5.0.1`); declaring it directly at 5.0.15 dedupes. |
| `@radix-ui/react-slider` | 1.5.0 | `react: "^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0 \|\| ^19.0.0-rc"` ✔ | Not inspected | UI chrome only; include only if needed. |
| `class-variance-authority` | 0.7.1 | n/a | Not inspected | Dep `clsx ^2.1.1`. UI chrome only. |

---

## 2. React 19 compatibility — verified against official sources

Verification is two-layer: **(a)** peer ranges read live from the registry (§1), **(b)** official release notes fetched 2026-10-06:

1. **`@react-three/fiber` v9.0.0** — GitHub release, published 2025-02-19. Quoted verbatim:
   > “This is a compatibility release for React 19, which brings further performance, stability, and type improvements.”
   URL: https://github.com/pmndrs/react-three-fiber/releases/tag/v9.0.0
   Corroborated by the official docs (fetched, quoted): “@react-three/fiber@8 pairs with react@18, **@react-three/fiber@9 pairs with react@19**.” — https://r3f.docs.pmnd.rs/getting-started/installation
2. **`@react-three/drei` v10.0.0** — GitHub release, published 2025-02-19. Quoted: “BREAKING CHANGE: React 19 support ([#2318])”. URL: https://github.com/pmndrs/drei/releases/tag/v10.0.0
3. **`@react-three/postprocessing` v3.0.0** — GitHub release, published 2025-02-19. Quoted: “BREAKING CHANGE: React 19 support (#318)”. URL: https://github.com/pmndrs/react-postprocessing/releases/tag/v3.0.0
4. Current versions on the registry carry ranges that include React 19.2.8: r3f `>=19 <19.4`, drei `^19`, postprocessing wrapper `^19.0.0`, rapier `^19`.

**Finding:** the entire pmndrs stack installed at §4 versions explicitly targets React 19. Note the r3f upper bound `<19.4` — fine for 19.2.8, but a future React 19.4+ bump will produce npm peer warnings until r3f widens the range.

**Note on `motion` vs `framer-motion`:** official upgrade guide (fetched, quoted): “To upgrade to Motion for React, uninstall `framer-motion` and install `motion` … swap imports from `"framer-motion"` to `"motion/react"`.” — https://motion.dev/docs/react-upgrade-guide

**Note on GSAP plugins:** official blog (fetched, quoted): “GSAP is now 100% FREE including ALL of the bonus plugins like SplitText, MorphSVG… all of the bonus plugins have been added to the main GSAP Github repository and NPM package.” — https://gsap.com/blog/3-13. Confirmed structurally in the 3.15.0 tarball listing (plugin files present, §1b).

---

## 3. TypeScript types for `three` — decisive answer

**`three@0.186.1` does NOT ship its own types. `@types/three@0.186.0` is required.**

Evidence (primary, from the published artifact):

- `three@0.186.1` package metadata has **no** `types` and **no** `typings` field (`npm view` / registry JSON).
- jsdelivr flat file listing for `three@0.186.1`: **1,263 files, 0 files ending in `.d.ts`**; `/build/` contains only `three.cjs`, `three.core.js`, `three.module.js`, `three.tsl.js`, `three.webgpu.js`, `three.webgpu.nodes.js`.
- `@types/three@0.186.0` exists, was updated 2026-09-11, and its file listing (964 files) covers `examples/jsm/**/*.d.ts` — so `three/addons/*` typing comes from it too.
- The official three.js installation docs page (fetched 2026-10-06) only covers `npm install --save three` + bundler/CDN; it gives **no** indication of bundled types.
- Version alignment: `three@0.186.1` ↔ `@types/three@0.186.0` (DefinitelyTyped tracks the rXXX minor). Both exist and dry-run together cleanly.

Minor detail worth knowing: `@types/three` pulls its own deps (`fflate`, `meshoptimizer`, `@tweenjs/tween.js`, `@types/webxr`, `@types/stats.js`, `@dimforge/rapier3d-compat`). That's normal for DefinitelyTyped; they are type-level/runtime shims, not a second copy of three.

---

## 4. Install feasibility — measured, not assumed

All commands below ran in **throwaway directories under `/tmp/stackcheck/`** (`--dry-run`, `--no-audit`, `--no-fund`). npm 11 resolves and reports what *would* happen; **nothing was installed and the workspace was not modified**.

| Test | Command shape | Result |
|---|---|---|
| Core set (14 pkgs incl. next/react anchors) | `npm install --dry-run` | **exit 0, 99 packages, 0 warnings** (grep for `warn\|eresolve\|deprecat` = 0 lines) |
| Nice-to-have set (incl. leva, offscreen, spline, spring, TCSM, theatre core/studio, radix, cva) | `npm install --dry-run` | **exit 0, 167 packages, 0 warnings** |
| Dev/asset set (`@types/three`, `@gltf-transform/cli`, `@gltf-transform/core`, `sharp`) | `npm install --dry-run` | **exit 0, 181 packages** |
| `postprocessing` auto-peer behavior | install `@react-three/postprocessing` alone | npm adds **`postprocessing 6.39.5` automatically** as a peer — but declare it explicitly anyway for version intent |
| **Risk demo: `@theatre/r3f@0.7.2` + `@react-three/fiber@9.8.1`** | `npm install --dry-run` | **FAILS — `npm error code ERESOLVE`**; “Could not resolve dependency: peer @react-three/fiber@"^8.13.6" from @theatre/r3f@0.7.2 … Found: @react-three/fiber@9.8.1”. Hard proof this combination cannot install without `--force`/`--legacy-peer-deps`. |
| Exact core command (§5) | `npm install --dry-run three@0.186.1 … zustand@5.0.15` | **exit 0, 89 packages, 0 warnings** |
| Exact dev command (§5) | `npm install --dry-run -D @types/three@0.186.0` | **exit 0, 29 packages** |

Practical consequence: **no `--legacy-peer-deps`, no `--force`, no overrides needed** for the recommended sets.

---

## 5. Recommendation

### ✅ Core — install these (runtime)

| Package | Version | Why |
|---|---|---|
| `three` | 0.186.1 | The renderer itself. |
| `@react-three/fiber` | 9.8.1 | React renderer for three; React 19 line (v9). |
| `@react-three/drei` | 10.7.9 | Controls, loaders, helpers, `ScrollControls`, environments — the workhorses for a storytelling scene. |
| `gsap` | 3.15.0 | Scroll-timeline engine; ScrollTrigger + ScrollSmoother + SplitText all free in the public package. |
| `@gsap/react` | 2.1.2 | Official `useGSAP()` hook. |
| `lenis` | 1.3.26 | Smooth scrolling driver (has first-party React subpath). |
| `zustand` | 5.0.15 | Scene state shared across Canvas + DOM UI; already transitive, declarer at top level for a single deduped copy. |

### ✅ Core — devDependency

| Package | Version | Why |
|---|---|---|
| `@types/three` | 0.186.0 | **Mandatory** — three ships no `.d.ts` (§3). |

### ➕ Nice-to-have (add per feature need)

| Package | Version | When |
|---|---|---|
| `@react-three/postprocessing` (+ `postprocessing`) | 3.1.3 / 6.39.5 | Bloom, DOF, vignette, custom effects. Add when post FX is actually used. |
| `motion` | 14.0.0 | DOM/UI micro-interactions with the same authoring model as the old framer-motion; also has a `motion/three` binding for three uniforms. Install **instead of** `framer-motion`. |
| `@react-three/rapier` | 2.2.0 | Physics (collisions, soft-body, character control). |
| `leva` | 0.10.1 | Live debug panel for scene params (dev convenience). |
| `camera-controls` | 3.1.2 | Direct use of the camera rig drei wraps. |
| `maath` | 0.10.8 | Math/geometry helpers for direct imports (drei already depends on it). |
| `three-custom-shader-material` | 6.4.0 | If custom GLSL must extend a standard material (keep drei/additive shaders for simpler cases). |
| `@react-spring/three` | 10.1.2 | Alternative spring-based 3D animation; only if the spring model is preferred over GSAP. See unverified note §6. |
| `@gltf-transform/cli` (+ `@gltf-transform/core`) | 4.5.1 | Model compression/optimization step (Draco/Meshopt/validator) in npm scripts; Node 24 OK. |
| `sharp` | 0.35.5 | Texture/OG-image pipeline scripting (also the binary Next uses for image optimization). |
| `@splinetool/react-spline` + `@splinetool/runtime` | 4.1.0 / 2.0.71 | Only if a Spline scene is part of the art direction — see §6 for the React 19 caveat. |
| `zustand@5.0.15` is core; `@radix-ui/react-slider` 1.5.0 + `class-variance-authority` 0.7.1 | — | Only if UI chrome widgets are needed; both React-19-compatible. |

### ⛔ Deliberately skip (with reason)

| Package | Reason (evidence) |
|---|---|
| `@studio-freight/lenis`, `@studio-freight/react-lenis` | npm deprecation notice on the packages: “has been renamed to 'lenis'”. Use `lenis`. |
| `@theatre/r3f` | **ERESOLVE failure** against r3f 9.8.1 (peer `^8.13.6`); reproduced in dry-run. Unusable with this stack without force-flags. |
| `@theatre/core` + `@theatre/studio` | No publish since 2024-05-19; repo README: “We have *temporarily* moved development to a private repo” for the 1.0 push. Framework-agnostic so they can still run, but authoring path for the 3D story (the r3f binding) is broken → author in GSAP timelines instead. Revisit when Theatre 1.0 lands. |
| `@react-three/cannon` | Last release 2023-08-17; the maintained option with an r3f-v9 peer is `@react-three/rapier`. |
| `vite-plugin-glsl` | Vite-only peers (`vite >=3.x`); Next.js does not use Vite. No working effect in this project. |
| `glsl-noise` (as direct dep) | 12-file package of raw `.glsl` sources, no `index.js` in the tarball despite its `main` field, no types, last touched 2022. It remains fine as drei's internal dep, but do not add it directly. Shader snippets can be pasted/inlined instead. |
| `@react-three/offscreen` | Latest stable 0.0.8; the only newer artifact is `1.0.0-rc.1` (2025-01-30). No explicit React 19 claim. Not warranted for a standard storytelling site. |
| `framer-motion` (as new install) | Not deprecated, but the successor package is `motion` and its docs say to import from `motion/react`. Installing both duplicates the animation engine. |

### 📦 Exact install commands (verified with `--dry-run`, exit 0)

```bash
# CORE — runtime dependencies
npm install three@0.186.1 @react-three/fiber@9.8.1 @react-three/drei@10.7.9 gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.26 zustand@5.0.15

# CORE — devDependencies (three has no bundled types)
npm install -D @types/three@0.186.0
```

Optional feature adds (each verified resolvable; run only the ones needed):

```bash
# Post-processing FX
npm install @react-three/postprocessing@3.1.3 postprocessing@6.39.5

# UI motion (successor of framer-motion)
npm install motion@14.0.0

# Physics
npm install @react-three/rapier@2.2.0

# Dev debug GUI
npm install -D leva@0.10.1

# Asset pipeline (model optimization + textures)
npm install -D @gltf-transform/cli@4.5.1 sharp@0.35.5

# Spline scenes (see §6 caveat)
npm install @splinetool/react-spline@4.1.0 @splinetool/runtime@2.0.71

# Spring-based 3D animation (alternative to GSAP; see §6)
npm install @react-spring/three@10.1.2
```

---

## 6. Risk register

1. **`@theatre/r3f` is a hard blocker with r3f v9** — ERESOLVE reproduced (peer `^8.13.6`). Also `@theatre/*` has had no release since 2024-05-19 and development is in a private repo. *Do not plan the animation authoring around Theatre for now.*
2. **`@studio-freight/lenis` is deprecated** — keep it out of the tree; `lenis@1.3.26` is the current package (its own `react` peer is optional, so no React constraint issue).
3. **React 19 support of two optionals is NOT explicitly claimed anywhere I could verify:**
   - `@react-three/offscreen` (peer `>=18`; newest artifact is a 2025-01-30 rc). Untested for React 19 by its own metadata.
   - `@splinetool/react-spline` (peer `react: "*"`, i.e. unconstrained). The runtime (`@splinetool/runtime` 2.0.71) is actively maintained (published 2026-10-05). Treat as “likely works, not declared” and smoke-test one scene.
4. **`@react-spring/three` 10.1.2** — registry metadata is fine (peer allows `@react-three/fiber >=6.0` and React 19), but the npm README is stale (“for version 6 of react-three-fiber”) and I found no release notes confirming v9 testing. Medium confidence only; prefer GSAP for the narrative timeline and keep spring as an extra.
5. **`glsl-noise` cannot be consumed as-is** from user code (no `index.js` in the tarball, no loader contract for Next). Use inline GLSL template strings or Drei's shader helpers.
6. **ESM-only packages** in the set: `@react-three/postprocessing` (single ESM entry) and `lenis` (ESM-only entry). Modern Next/webpack/Turbopack bundles handle these, but they cannot be `require()`d from CJS config files. `three`, `gsap`, `motion`, `zustand`, `camera-controls`, `postprocessing`, `rapier`, `spline runtime`, gltf-transform provide dual paths.
7. **r3f peer cap `react >=19 <19.4`** — current 19.2.8 fits; a future React minor bump past 19.3 will re-trigger peer warnings. Pin-aware upgrades only.
8. **`three` ↔ `postprocessing` version window** — postprocessing 6.39.5 accepts `three >=0.168.0 <0.187.0`; three 0.186.1 fits. If `three` is bumped past 0.186.x before postprocessing widens the range, re-check.
9. **`leva` internally pins `zustand ^3.6.9`** — nested duplicate only; no conflict with top-level zustand 5.0.15, just bundle-size awareness (dev panel).
10. **License note (not a blocker):** `@theatre/studio` is AGPL-3.0 (design-time only); GSAP 3.15.0 is under the “Standard 'no charge' license” (free incl. commercial per the 3.13 announcement); `@theatre/core` Apache-2.0.

---

## 7. Unverified / not checked (explicit)

| Item | Status |
|---|---|
| `@react-three/offscreen` React 19 runtime behavior | **Unverified** — no release notes/claims found; peer `>=18` only. |
| `@splinetool/react-spline` React 19-specific support | **Unverified** — peer `react: "*"`; no React 19 statement in README (fetched from GitHub). |
| `three-custom-shader-material` React 19 testing | **Unverified** — peer `react: ">=18"` (optional); last release 2025-10-12. |
| `@react-spring/three` v10 + r3f v9 in practice | **Unverified** — no release notes fetched; npm README stale. |
| GLSL file imports (`.glsl`/`.frag` as strings) under Next 16 + Turbopack | **Unverified here — belongs to the Next.js researcher.** No Next-compatible GLSL loader identified in npm search (only Vite/Webpack ones); needs a Next-side rule decision. |
| `@gsap/react` 2.1.2 ESM/CJS shape | Not inspected (only version + peers). Low risk. |
| `@radix-ui/react-slider`, `class-variance-authority` module format & publish dates | Not inspected (versions + peers verified only). Low risk. |
| `@react-three/cannon` module format | Not inspected (in skip bucket). |
| Behaviour of any of the above *inside* a Next.js 16 App Router tree (RSC/client boundaries, transpilation) | **Not tested** — Next-side concerns; flagged below. |

---

## 8. Open questions for the parent (Next.js side — not ruled on here)

1. **`transpilePackages`** — the official r3f docs recommend, for Next.js: “It should work out of the box but you will encounter untranspiled add-ons in the three.js ecosystem, in that case … `transpilePackages: ['three']`” (https://r3f.docs.pmnd.rs/getting-started/installation). Whether Next 16.3.8 + Turbopack still needs this is for the Next.js researcher.
2. **Client boundaries** — any component holding `<Canvas>` must be client-side. Standard `'use client'` / dynamic-import pattern; confirm against the Next 16 docs.
3. **GLSL asset imports** — if the project wants `.glsl` files imported as strings, a custom bundler rule is needed; no verified Next 16/Turbopack mechanism was found in this research. Decide: inline GLSL strings (zero config) vs. loader (config change).
4. **Spline `/next` subpath** — `@splinetool/react-spline/next` exists in the package (verified in `exports`), but its SSR-placeholder behavior with Next 16 App Router should be smoke-tested.
5. **`three/addons/*` import style with `@types/three`** — types exist under `examples/jsm/**`; whether the `three/addons/*` alias resolves for TypeScript under this project's `moduleResolution` setting should be checked once by the parent (import either `three/examples/jsm/...` or `three/addons/...` consistently).

---

## 9. Evidence log (reproducible)

**Commands run 2026-10-06 (all read-only / dry-run):**

```
npm view <pkg> version | peerDependencies --json | peerDependenciesMeta --json | exports --json | type | dist-tags | deprecated | time --json   (for every package in §1)
curl -s https://registry.npmjs.org/<pkg>/<version>            # raw metadata (three@0.186.1, gsap@3.15.0, glsl-noise@0.0.0, motion@14.0.0, @theatre/*)
curl -s "https://data.jsdelivr.com/v1/packages/npm/three@0.186.1?structure=flat"        # 1263 files, 0 .d.ts
curl -s "https://data.jsdelivr.com/v1/packages/npm/gsap@3.15.0?structure=flat"          # bonus plugins present
curl -s "https://data.jsdelivr.com/v1/packages/npm/@types/three@0.186.0?structure=flat" # 964 files, examples/jsm covered
curl -s "https://data.jsdelivr.com/v1/packages/npm/glsl-noise@0.0.0?structure=flat"     # 12 files, no index.js
npm install --dry-run --no-audit --no-fund   (in /tmp/stackcheck/{,b,c,d,e,f,g})        # resolution tests, §4
curl -s https://unpkg.com/lenis@1.3.26/package.json                                     # exports incl. ./react
curl -s -o /dev/null -w "%{http_code}" https://unpkg.com/@splinetool/react-spline@4.1.0/dist/react-spline-next.js   # 200
```

**Web sources fetched/quoted (2026-10-06):**

| URL | Quoted fact |
|---|---|
| https://github.com/pmndrs/react-three-fiber/releases/tag/v9.0.0 | “This is a compatibility release for React 19…” (published 2025-02-19) |
| https://github.com/pmndrs/drei/releases/tag/v10.0.0 | “BREAKING CHANGE: React 19 support (#2318)” (2025-02-19) |
| https://github.com/pmndrs/react-postprocessing/releases/tag/v3.0.0 | “BREAKING CHANGE: React 19 support (#318)” (2025-02-19) |
| https://r3f.docs.pmnd.rs/getting-started/installation | “@react-three/fiber@8 pairs with react@18, @react-three/fiber@9 pairs with react@19”; Next.js `transpilePackages: ['three']` guidance |
| https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide | v9 breaking changes: `CanvasProps`, `ThreeElements`, StrictMode inheritance, texture colorSpace |
| https://gsap.com/blog/3-13 | “GSAP is now 100% FREE including ALL of the bonus plugins…” |
| https://motion.dev/docs/react-upgrade-guide | “uninstall `framer-motion` and install `motion`… import { motion } from "motion/react"” |
| https://github.com/theatre-js/theatre (README) | “Theatre.js 1.0 is around the corner. We have *temporarily* moved development to a private repo…” |
| https://threejs.org/docs/manual/en/introduction/Installation.html | npm install guidance; no bundled-types statement |
| https://www.npmjs.com/package/@react-spring/three | README: “This package is for version 6 of react-three-fiber” (stale) |
| https://github.com/splinetool/react-spline (README) | `@splinetool/react-spline/next` usage for SSR placeholder |

**Untouched by this research:** project `package.json`, `package-lock.json`, `node_modules/` — no installs, no builds, no writes outside this report file.
