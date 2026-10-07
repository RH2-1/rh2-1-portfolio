# ASSETS.md — verified 3D content sources, local asset pipeline, licence manifest

**Workspace:** `/home/arthur/bin/webdesign1` · **Verified:** 2026-10-06 · **Node** v24.20.0 · **npm** 11.19.0
**Scope of this file:** asset sourcing, URL verification, downloads under `public/`, and the local
preparation pipeline. Framework conventions and the npm stack are owned by sibling researchers.

Every URL below was HTTP-status-checked on 2026-10-06 with
`curl -sS -I -L --max-time 45 <url>`. Reported size is the `content-length` of the response
(HEAD), or the actually-downloaded `size_download` where noted. Verification method is stated
per row.

---

## 1. On disk now — downloaded starter set

14 files, **6,722,588 bytes total (6.41 MiB)**, under `public/models/` and `public/hdr/`.
Each verified: GLB files parse with magic `glTF`, version `2`, and the declared byte length
matches the file size; HDR files start with the RADIANCE `#?RADIANCE` signature; JPEG textures
start with `FF D8 FF`; the Kenney archive passed `unzip -t`.

| File (workspace-relative) | Bytes | Format | Source URL | Licence | Attribution |
|---|---|---|---|---|---|
| `public/models/Fox.glb` | 162,852 | glb | https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb | Model CC0-1.0; rig+animation CC-BY-4.0; glTF conversion CC-BY-4.0 | **Yes** — see §4 |
| `public/models/RobotExpressive.glb` | 463,988 | glb | https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb | CC0-1.0 | Not required (appreciated) |
| `public/models/astronautA.glb` | 27,912 | glb | https://kenney.nl/media/pages/assets/space-kit/20874c75ac-1677698978/kenney_space-kit.zip → `Models/GLTF format/astronautA.glb` | CC0-1.0 | Not required |
| `public/models/astronautB.glb` | 27,824 | glb | same archive → `Models/GLTF format/astronautB.glb` | CC0-1.0 | Not required |
| `public/models/alien.glb` | 27,784 | glb | same archive → `Models/GLTF format/alien.glb` | CC0-1.0 | Not required |
| `public/models/barrel.glb` | 4,656 | glb | same archive → `Models/GLTF format/barrel.glb` | CC0-1.0 | Not required |
| `public/models/moon_rock_01/moon_rock_01_1k.gltf` | 7,088 | gltf | https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/moon_rock_01/moon_rock_01_1k.gltf | CC0 | Not required |
| `public/models/moon_rock_01/moon_rock_01.bin` | 448,168 | bin | https://dl.polyhaven.org/file/ph-assets/Models/gltf/8k/moon_rock_01/moon_rock_01.bin | CC0 | Not required |
| `public/models/moon_rock_01/textures/moon_rock_01_diff_1k.jpg` | 276,354 | jpg | https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/moon_rock_01/moon_rock_01_diff_1k.jpg | CC0 | Not required |
| `public/models/moon_rock_01/textures/moon_rock_01_nor_gl_1k.jpg` | 645,714 | jpg | https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/moon_rock_01/moon_rock_01_nor_gl_1k.jpg | CC0 | Not required |
| `public/models/moon_rock_01/textures/moon_rock_01_arm_1k.jpg` | 330,395 | jpg | https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/moon_rock_01/moon_rock_01_arm_1k.jpg | CC0 | Not required |
| `public/hdr/kloppenheim_06_puresky_1k.hdr` | 1,173,154 | hdr | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr | CC0 | Not required |
| `public/hdr/venice_sunset_1k.hdr` | 1,440,400 | hdr | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr | CC0 | Not required |
| `public/hdr/studio_small_03_1k.hdr` | 1,686,299 | hdr | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr | CC0 | Not required |

**Full SHA-256 checksums of the downloaded set:**

```
206c67e3a1b992282821cf06662bdd69bbb4915c1c4444a66338a40d6a7d4e34  public/hdr/kloppenheim_06_puresky_1k.hdr
30933d55e45f0795daf49f3cbefbe0e5ebcb821ee04fb0a2818c02ffc3938817  public/hdr/studio_small_03_1k.hdr
92fe2b29b1957828fb8925a57633540bbba5bf380d9285ed553443e834249352  public/hdr/venice_sunset_1k.hdr
c041e8ed0eff82f0b25b944a8107f1268ddbec9c2c93afedc4ee0e8b047d983d  public/models/alien.glb
9db62dd9790beadc1b8e45cf9623e99ade21751bb23f16dfe1b8cfb05a54f3b5  public/models/astronautA.glb
6fa5b3e11cb3d117b28a0794b261ad9107f16ca6ce886b288493e22493d74d2d  public/models/astronautB.glb
8a95781be23b35ebb39ad90278affc03140c75d4d055027e98be0313de084451  public/models/barrel.glb
d97044e701822bac5a62696459b27d7b375aada5de8574ed4362edbba94771f7  public/models/Fox.glb
004cc353fa0c29572a9ba40535f3716c297466fdf2c650d36deaf9e27eed5ce7  public/models/moon_rock_01/moon_rock_01_1k.gltf
c6671327046efd27ab1a97c4c716412f209a063184e65f0376e3be6583e8f52a  public/models/moon_rock_01/moon_rock_01.bin
168cbef24f61a6602068d634f858a297bfa7b3675a43be6230e0daf2e8953cf9  public/models/moon_rock_01/textures/moon_rock_01_arm_1k.jpg
1cdcb7dea183431326751abc03d30f89f1c51e99ce5b851401d51bd38f606c0b  public/models/moon_rock_01/textures/moon_rock_01_diff_1k.jpg
0b58d5009e7b317698eaff224bcf01c912c11ffc52203a728940e5e46a7494e9  public/models/moon_rock_01/textures/moon_rock_01_nor_gl_1k.jpg
047f5e5fb3bb6d378bd1df16ca6137f2a596c99b3a1b5690b4020c05aaf6f319  public/models/RobotExpressive.glb
```

Note `moon_rock_01.bin` is served from the `8k/` path — Poly Haven reuses one geometry buffer
across texture resolutions; this is the URL the Poly Haven API itself returns for the 1k glTF.
The `.gltf` references `moon_rock_01.bin` and `textures/*.jpg` relatively, and all three
`images[].uri` plus the single `buffers[].uri` resolve inside the copied directory (verified by
`fs.existsSync` — 0 unresolved URIs). **Keep this directory structure intact** or the model
will not load.

**Not kept on disk:** the Kenney `kenney_space-kit.zip` (6,677,531 B) was downloaded to `/tmp`,
its four GLBs extracted into `public/models/`, and the archive was *not* copied into the
workspace. Source archive URL is recorded above for provenance.

---

## 2. Candidate table — verified sources (all HTTP-checked)

### 2a. Khronos glTF-Sample-Assets — pattern and verification

Direct-asset pattern (confirmed working):

```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/<Model>/glTF-Binary/<Model>.glb
```

The sibling `/glTF/<Model>.gltf` and `/glTF-Embedded/` variants exist for most models and are
**not** self-contained — they need companion `.bin`/textures. The `glTF-KTX-BasisU` variant is
self-contained but requires `KHR_texture_basisu` support. Use `glTF-Binary` for a single file.

There is **no `model-index.json` licence index** — that file (`Models/model-index.json`) only
carries `label`/`name`/`screenshot`/`tags`/`variants`. The authoritative machine-readable
licence record is **`Models/<Model>/metadata.json` → `legal[]`**, with a human-readable
`Models/<Model>/LICENSE.md`. Both were read for the models below.

| Model | URL (pattern above) | HTTP | Bytes | Format | Licence (from `metadata.json` `legal[]`) | Verdict |
|---|---|---|---|---|---|---|
| Fox | `.../Models/Fox/glTF-Binary/Fox.glb` | 200 | 162,852 | glb | `CC0-1.0` "Model" (PixelMannen) + `CC-BY-4.0` "Rigging & Animation" (tomkranis) + `CC-BY-4.0` "Conversion to glTF" | ✅ clean, attribution required |
| ToyCar | `.../Models/ToyCar/glTF-Binary/ToyCar.glb` | 200 | 5,422,412 | glb | `CC0-1.0` "Initial car model" (Guido Odendahl) + `CC0-1.0` "Extensions and scene composition" (Eric Chadwick) | ✅ clean, no attribution |
| Lantern | `.../Models/Lantern/glTF-Binary/Lantern.glb` | 200 | 9,564,264 | glb | `CC0-1.0` (sbtron, Frank Galligan) | ✅ clean, no attribution |
| SheenChair | `.../Models/SheenChair/glTF-Binary/SheenChair.glb` | 200 | 4,125,648 | glb | `CC0-1.0` "Everything" (Eric Chadwick) | ✅ clean, no attribution |
| Avocado | `.../Models/Avocado/glTF-Binary/Avocado.glb` | 200 | 8,110,040 | glb | `CC0-1.0` "Everything" (Microsoft) | ✅ clean |
| BoomBox | `.../Models/BoomBox/glTF-Binary/BoomBox.glb` | 200 | 10,614,184 | glb | `CC0-1.0` "Everything" (Microsoft) | ✅ clean |
| WaterBottle | `.../Models/WaterBottle/glTF-Binary/WaterBottle.glb` | 200 | 8,966,700 | glb | `CC0-1.0` "Everything" (Microsoft) | ✅ clean |
| ClearCoatCarPaint | `.../Models/ClearCoatCarPaint/glTF-Binary/ClearCoatCarPaint.glb` | 200 | 116,948 | glb | `CC0-1.0` "Everything" (Eric Chadwick) | ✅ clean |
| AntiqueCamera | `.../Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb` | 200 | 17,540,348 | glb | `CC0-1.0` "Everything" (Maximillan Kamps); `null` for the UX3D logo (non-copyrightable) | ✅ clean |
| **DamagedHelmet** | `.../Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb` | 200 | 3,773,916 | glb | `CC-BY-4.0` "Rebuild and conversion to glTF" **+ `CC-BY-NC-4.0` "Earlier version of model" (theblueturtle_)** | ❌ **AVOID** — NC taint |
| **Sponza** | `.../Models/Sponza/glTF-Binary/Sponza.glb` | **404** | — | — | `LicenseRef-CRYENGINE-Agreement` (Cryengine Limited License Agreement) | ❌ **unusable** |
| FlightHelmet | `.../Models/FlightHelmet/glTF/FlightHelmet.gltf` | 200 | 18,698 (gltf only) | gltf | `CC0-1.0` model | ⚠️ no `glTF-Binary`; needs companion files |
| DragonAttenuation | `.../Models/DragonAttenuation/glTF-Binary/DragonAttenuation.glb` | 200 | 6,401,616 | glb | Stanford Graphics Library + `CC0-1.0` mixed | ⚠️ mixed, check before use |
| IridescenceLamp | `.../Models/IridescenceLamp/glTF-Binary/IridescenceLamp.glb` | 200 | 4,083,912 | glb | `CC-BY-4.0` | ⚠️ attribution required |
| MosquitoInAmber | `.../Models/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb` | 200 | 24,229,904 | glb | `CC-BY-4.0` | ⚠️ heavy |
| MetalRoughSpheres | `.../Models/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb` | 200 | 11,221,356 | glb | `CC-BY-4.0` | ⚠️ test asset, not hero |
| ABeautifulGame | `.../Models/ABeautifulGame/glTF-Binary/ABeautifulGame.glb` | 200 | 42,977,928 | glb | `CC-BY-4.0` | ⚠️ 41 MB — over budget |
| StainedGlassLamp | `.../Models/StainedGlassLamp/glTF-Binary/StainedGlassLamp.glb` | **404** | — | — | `CC-BY-4.0` | ❌ no binary variant at that path |

**Two explicit negatives, as required:** `Sponza.glb` **404s** (only an unbundled `glTF/` tree
with ~40 MB of loose JPGs exists, and the licence is CRYENGINE — not redistributable here).
`StainedGlassLamp.glb` **404s** at the binary path. `DamagedHelmet` is reachable (200) and is
the canonical demo model, but it is **not** legally clean for a commercial narrative site: its
own `metadata.json` lists a `CC-BY-NC-4.0` upstream. It is therefore **not** downloaded.

### 2b. Poly Haven — CC0 HDRIs and models

Download-URL pattern (confirmed working). The file name is duplicated in the directory segment:

```
https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/<asset>_1k.hdr
```

HDRI rows (all HTTP-checked):

| Asset | URL | HTTP | Bytes | Type header |
|---|---|---|---|---|
| Kloppenheim 06 Pure Sky | `.../HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr` | 200 | 1,173,154 | `application/octet-stream` |
| Venice Sunset | `.../HDRIs/hdr/1k/venice_sunset_1k.hdr` | 200 | 1,440,400 | `image/vnd.radiance` |
| Studio Small 03 | `.../HDRIs/hdr/1k/studio_small_03_1k.hdr` | 200 | 1,686,299 | `image/vnd.radiance` |
| Sunflowers Pure Sky | `.../HDRIs/hdr/1k/sunflowers_puresky_1k.hdr` | 200 | 1,482,923 | `application/octet-stream` |
| Moonless Golf | `.../HDRIs/hdr/1k/moonless_golf_1k.hdr` | 200 | 1,672,754 | `application/octet-stream` |

Model rows. **Important:** the obvious `.../Models/gltf/1k/<asset>/<asset>.gltf` guess **404s**
(`{"code":"not_found"}`). The real filename carries the resolution suffix:
`<asset>_1k.gltf`. Models are multi-file — the `.gltf` pulls a shared `.bin` and `textures/*.jpg`:

| Asset | Verified glTF URL | HTTP | Total bytes (size + all `include`) |
|---|---|---|---|
| Moon Rock 01 ✅ downloaded | `.../Models/gltf/1k/moon_rock_01/moon_rock_01_1k.gltf` | 200 | 1,707,719 |
| Rock Moss Set 01 | `.../Models/gltf/1k/rock_moss_set_01/rock_moss_set_01_1k.gltf` | 200 (9,987 B root) | 1,937,065 |
| Rock Face 01 | `.../Models/gltf/1k/rock_face_01/rock_face_01_1k.gltf` | 200 (2,793 B root) | 3,049,988 |
| Namaqualand Cliff 01 | `.../Models/gltf/1k/namaqualand_cliff_01/namaqualand_cliff_01_1k.gltf` | 200 (2,848 B root) | 4,544,360 |
| Coast Land Rocks 02 | `.../Models/gltf/1k/coast_land_rocks_02/coast_land_rocks_02_1k.gltf` | — | 39,612,026 ❌ over budget |
| Coast Rocks 01 | `.../Models/gltf/1k/coast_rocks_01/coast_rocks_01_1k.gltf` | — | 21,684,204 ❌ over budget |

The authoritative way to enumerate a Poly Haven asset's files and exact URLs is its API, not URL
guessing — each `include` entry gives `size`, `url` and `md5`:

```bash
curl -s https://api.polyhaven.com/files/<asset_id> | jq '.gltf["1k"].gltf'
```

**Licence (verified at source, not from memory):** https://polyhaven.com/license states — *"All
assets (HDRIs, textures and 3D models) on this site … are all licensed as CC0"*, and *"You can
redistribute them, share them around, include them when sharing your own work, or even in a
product you sell."* Attribution is explicitly not required. Caveat recorded for completeness:
the `api.polyhaven.com/info/<asset>` endpoint returns `"license": null` for these same assets —
the CC0 grant lives on the licence page above, not in the API payload. The site ToS prohibits
scraping the *website*, which is unrelated to downloading assets over the documented
`dl.polyhaven.org` URLs and the public API used here.

### 2c. Other CC0 / CC-BY sources

| Source | Verified URL | HTTP | Bytes | Licence | Notes |
|---|---|---|---|---|---|
| Kenney — Space Kit | `https://kenney.nl/media/pages/assets/space-kit/20874c75ac-1677698978/kenney_space-kit.zip` | 200 | 6,677,531 | CC0-1.0 (`License.txt` in archive: *"License: (Creative Commons Zero, CC0)"*, *"free to use in personal, educational and commercial projects"*, crediting *"is not mandatory"*) | ✅ 153 `.glb` in `Models/GLTF format/`; 4 extracted |
| Kenney — Nature Kit | `https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip` | 200 | 10,537,521 | CC0-1.0 | ✅ whole-kit alternative |
| Quaternius | `https://quaternius.com/` — page 200, licence **CC0** confirmed | 200 | — | CC0 | ⚠️ **no direct `.zip` href** on the pack pages; downloads route through a JS/third-party flow. Hard to script; use Kenney for scriptable CC0 instead |
| ambientCG — Rock030 (material) | `https://ambientcg.com/get?file=Rock030_1K-JPG.zip` | 200 | 9,677,446 | CC0 | ✅ real download (`application/zip`); PBR texture set, not geometry |
| Sketchfab CC0 filter | `https://sketchfab.com/3d-models?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b` | 200 | — | CC0 (filtered) | ⚠️ requires auth to download; per-model licence must be re-checked on each asset page |
| jsDelivr CDN mirror (Khronos + three.js) | `https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Fox/glTF-Binary/Fox.glb` | 200 | — | inherits upstream | ✅ `content-type: model/gltf-binary`, `access-control-allow-origin: *` — use this instead of `raw.githubusercontent.com` when loading from a *remote* URL in the browser (raw GitHub serves `application/octet-stream` and is not a CDN) |

---

## 3. Local asset-preparation pipeline

`@gltf-transform/cli` was run on this machine via `npx` (one-off, nothing added to
`package.json`). **Version verified: 4.5.1.**

```bash
npx --yes @gltf-transform/cli@4.5.1 --version   # → 4.5.1
```

### 3a. Inspect a `.glb`

```bash
npx --yes @gltf-transform/cli@4.5.1 inspect public/models/Fox.glb
```

Prints OVERVIEW / SCENES / MESHES / MATERIALS / TEXTURES / ANIMATIONS tables including
`extensionsUsed`/`extensionsRequired`, bounding box, render and upload vertex counts. Use it to
catch a model that already requires `KHR_draco_mesh_compression` or `KHR_texture_basisu` before
you plan a loader.

### 3b. Compress — measured results on the actual downloaded files

Draco (geometry) + WebP (textures):

```bash
npx --yes @gltf-transform/cli@4.5.1 optimize <in.glb> <out.glb> \
  --compress draco --texture-compress webp
```

Meshopt (geometry only):

```bash
npx --yes @gltf-transform/cli@4.5.1 optimize <in.glb> <out.glb> --compress meshopt
```

Measured on this machine, 2026-10-06:

| Input | Original | `--compress draco --texture-compress webp` | `--compress meshopt` |
|---|---|---|---|
| `Fox.glb` | 162,852 B | **87,508 B** (−46.3 %) | 91,160 B (−44.0 %) |
| `RobotExpressive.glb` | 463,988 B | **182,576 B** (−60.7 %) | 183,320 B (−60.5 %) |
| `moon_rock_01_1k.gltf` (textured, 1.71 MB) | 1,707,719 B | — | **254,636 B** (−85.1 %) |

**Draco vs meshopt — how to choose:** Draco gave the smaller file on both meshes here, but it
adds a hard runtime dependency (`extensionsRequired: KHR_draco_mesh_compression` — verified in
the output header of the optimized RobotExpressive) and needs a WASM decoder hosted locally
(`public/draco/`) or configured via `setDecoderPath`. Meshopt also requires a decoder but its
runtime is far lighter (`extensionsRequired: EXT_meshopt_compression`). For a react-three-fiber
scrollytelling page, **meshopt is the lower-risk default**; take Draco only if the extra ~1–4 %
matters. The output file is still a valid GLB — re-verified: `magic=glTF v=2`, declared length
matches actual, 182,576 B.

Full-list note: `optimize --help` documents `--simplify`, `--simplify-ratio`,
`--simplify-error`, `--texture-size`, `--weld`, `--palette`, `--prune-solid-textures`. Every
one of those is a real size lever beyond raw codec choice.

### 3c. Textures → KTX2 / WebP

`--texture-compress` accepts `"ktx2"`, `"webp"`, `"avif"`, `"auto"`, or `false`.

- **WebP works here with zero extra setup** — that is the path used in the `--texture-compress
  webp` column above.
- **KTX2 does not work on this machine as-is.** Both the `etc1s` and `uastc` commands
  (and `--texture-compress ktx2`) shell out to an external `ktx` binary:

  ```
  error: Command failed: command -v ktx 2>/dev/null && { … }
  ```

  `which ktx` → not found; `which toktx` → not found. To enable the KTX2 path, install KTX-Software
  so that `ktx` is on `PATH`, then:

  ```bash
  npx --yes @gltf-transform/cli@4.5.1 etc1s <in.glb> <out.glb> --quality 128   # ETC1S, best size
  npx --yes @gltf-transform/cli@4.5.1 uastc <in.glb> <out.glb>                # UASTC, best quality
  # or fold it into the one-shot command:
  npx --yes @gltf-transform/cli@4.5.1 optimize <in.glb> <out.glb> --compress meshopt --texture-compress ktx2
  ```

  KTX2 optimizes VRAM/GPU upload; WebP/AVIF optimize transmission size. For a web narrative
  where total bytes dominate, **WebP is the pragmatic choice**; adopt KTX2 only if GPU memory
  or decode stalls become the bottleneck. Also available: standalone `webp`, `avif`.

### 3d. Where assets go in a Next.js app

Per this repo's own bundled docs — `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/public-folder.md`:
*"Next.js can serve static files, like images, under a folder called `public` in the root
directory. Files inside `public` can then be referenced by your code starting from the base URL
(`/`). For example, the file `public/avatars/me.png` can be viewed by visiting the
`/avatars/me.png` path."*

So with the current layout, the runtime URLs are:

| On disk | Runtime URL |
|---|---|
| `public/models/Fox.glb` | `/models/Fox.glb` |
| `public/models/RobotExpressive.glb` | `/models/RobotExpressive.glb` |
| `public/models/moon_rock_01/moon_rock_01_1k.gltf` | `/models/moon_rock_01/moon_rock_01_1k.gltf` (and its relative `moon_rock_01.bin` / `textures/*` resolve automatically) |
| `public/hdr/venice_sunset_1k.hdr` | `/hdr/venice_sunset_1k.hdr` |

**public/ vs imported:** use `public/` for these assets, referenced by plain string URL from
`useGLTF('/models/Fox.glb')` / `useTexture` / an HDR loader. Do **not** `import` a binary into
the bundle — `import` only earns its keep for build-time-processed static images through
`next/image`. Routing through `/public` also means the files are fetched at runtime, keeping
them out of the JS bundle. Two caveats from the same doc: the folder must be named exactly
`public` at the project root, and Next.js serves it with `Cache-Control: public, max-age=0`,
so asset caching must be handled by your own headers/CDN later.

---

## 4. Attribution — the one file that needs it

Every downloaded file is CC0 **except `Fox.glb`**, which is CC0 for the mesh but carries
CC-BY-4.0 on its rigging/animation and on its glTF conversion. Those upstream creators must be
credited. Suggested credit block:

```
Fox model: PixelMannen (CC0-1.0). Rigging & animation: tomkranis (CC-BY-4.0).
Conversion to glTF: @AsoboStudio and @scurest (CC-BY-4.0).
Source: KhronosGroup/glTF-Sample-Assets, Models/Fox.
https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Fox/LICENSE.md
```

`RobotExpressive.glb` is CC0-1.0; the model is by Tomás Laulhé with modifications by Don
McCurdy, and the source README asks that you *consider* supporting the creator — a courtesy
credit is good practice but not legally required. Poly Haven and Kenney assets require no
attribution; Kenney's own `License.txt` notes that crediting Kenney/kenney.nl is *"not
mandatory"*. If you want a single fully-unencumbered hero instead of Fox, use
`public/models/RobotExpressive.glb` (CC0) or grab `ToyCar.glb` / `Lantern.glb` /
`SheenChair.glb` from §2a.

---

## 5. Three good candidates deliberately NOT downloaded

All three were HTTP-status-checked; none is on disk, so the workspace stays clear of anything
whose licence or size has not been signed off.

1. **ToyCar** — `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb`
   — **HTTP 200**, 5,422,412 B, glb, **CC0-1.0 throughout** (Guido Odendahl + Eric Chadwick).
   Best all-round hero: zero attribution, PBR-clean, at 5.4 MB it survives a WebP pass well.
   *Suggested use:* the main scroll-driven hero subject.

2. **Lantern** — `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb`
   — **HTTP 200**, 9,564,264 B, glb, **CC0-1.0** (sbtron; Draco compression by Frank Galligan).
   A lit, emissive-capable subject — pairs naturally with the sunset HDRIs for the
   "dusk reveal" beat of a scrollytelling arc. *Suggested use:* alternate hero / chapter-2 subject.

3. **Rock Moss Set 01 (Poly Haven)** — `https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/rock_moss_set_01/rock_moss_set_01_1k.gltf`
   — **HTTP 200** (9,987 B root), **1,937,065 B total** across its 4 companion files, gltf+bin+jpg,
   **CC0**. A mossy rock cluster that reads as organic ground detail and is slightly richer than
   the flat `moon_rock_01`. *Suggested use:* upgrade the ground/environment layer for a natural
   rather than lunar look. Enumerate its exact part URLs with
   `curl -s https://api.polyhaven.com/files/rock_moss_set_01 | jq '.gltf["1k"].gltf'`.

Runner-up worth knowing: `namaqualand_cliff_01` (4,544,360 B, CC0, HTTP 200) makes a convincing
cliff-face backdrop.

---

## 6. Commands to run later

Copy-paste, from `/home/arthur/bin/webdesign1`. Nothing here is persistent — `npx` fetches the
CLI per run and adds nothing to `package.json`.

```bash
# 1. Inspect what a model actually contains (extensions, mesh counts, textures)
npx --yes @gltf-transform/cli@4.5.1 inspect public/models/Fox.glb

# 2. Compress for the web — RECOMMENDED default (light runtime, no external tools)
npx --yes @gltf-transform/cli@4.5.1 optimize public/models/Fox.glb \
  public/models/Fox.opt.glb --compress meshopt --texture-compress webp

# 3. Same, smaller geometry, heavier runtime (needs Draco decoder in the app)
npx --yes @gltf-transform/cli@4.5.1 optimize public/models/Fox.glb \
  public/models/Fox.opt.glb --compress draco --texture-compress webp

# 4. Cap texture resolution while you're at it (big win on 4k-source models)
npx --yes @gltf-transform/cli@4.5.1 optimize public/models/RobotExpressive.glb \
  public/models/RobotExpressive.opt.glb --compress meshopt --texture-compress webp --texture-size 1024

# 5. Flatten the multi-file Poly Haven glTF into one portable GLB
npx --yes @gltf-transform/cli@4.5.1 optimize public/models/moon_rock_01/moon_rock_01_1k.gltf \
  public/models/moon_rock_01.glb --compress meshopt --texture-compress webp

# 6. KTX2 — ONLY after installing KTX-Software so `ktx` is on PATH
npx --yes @gltf-transform/cli@4.5.1 etc1s public/models/Fox.glb public/models/Fox.ktx2.glb --quality 128
```

Command 5 is the highest-value one for this project: it collapses the four-file Poly Haven
directory into a single GLB (measured equivalent: 1,707,719 B → 254,636 B) and removes the
"relative URIs must stay intact" constraint recorded in §1.

Verified working verbatim during this run (`public/models/RobotExpressive.glb` →
`/tmp/out/RobotExpressive.opt.glb`, 463,988 B → 182,576 B, output re-parsed as valid GLB).
