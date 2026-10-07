import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createSky } from "./sky";
import {
  createDisplacementUniforms,
  patchDisplacement,
  type DisplacementUniforms,
} from "./displacement";
import { BEATS, type Beat } from "./narrative";

/**
 * The whole 3D scene, in one imperative module.
 *
 * Design notes, so this stays easy to change later:
 *
 *  - Scene state is driven by ONE number, `progress` in [0, 1], read from
 *    window.scrollY. Chapters are equally sized, so progress maps onto the
 *    chapter list by construction. Nothing else tracks scroll.
 *  - The camera interpolates between adjacent beats rather than easing toward
 *    a target, so rewinding the scroll rewinds the shot exactly.
 *  - Every loaded model is measured at runtime and rescaled to a target height.
 *    This matters: these files disagree about units by two orders of magnitude
 *    (barrel.glb is 0.2 units tall, the raw Fox geometry is 154). Hardcoding
 *    scales would break the moment a model is swapped.
 *  - Lighting is a shader sky, not a texture file, so it can be re-tinted per
 *    chapter. Swapping in a real HDRI is a documented one-line change below.
 */

/** Height of the animated hero, in world units. Everything else keys off this. */
const HERO_HEIGHT = 1.35;
/** Most recent chapter can still be read while the camera settles. */
const CAMERA_DAMPING = 11;

export type SceneHandle = {
  /** Tears down the renderer, listeners, and GPU resources. */
  dispose(): void;
};

export type MountOptions = {
  /** Fires when the scene is ready to be shown. */
  onReady?: () => void;
  /** Fires once, with the number of loaded model assets that succeeded. */
  onAssetsLoaded?: (loaded: number, failed: number) => void;
};

// --- small helpers -------------------------------------------------------

function toVec3(t: readonly [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(t[0], t[1], t[2]);
}

/**
 * Scales `object` so its bounding box is `height` units tall, centres it on the
 * origin horizontally, and drops its feet onto y = 0.
 *
 * Ordering is deliberate: the box is measured while the object is untransformed,
 * because scaling by `s` then translating by `t` moves a point to `p * s + t`,
 * so the corrective offset has to be computed from the pre-scale box.
 */
function fitToHeight(object: THREE.Object3D, height: number): number {
  object.position.set(0, 0, 0);
  object.scale.setScalar(1);
  object.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const s = height / Math.max(size.y, 1e-4);
  object.scale.setScalar(s);
  object.position.set(-center.x * s, -box.min.y * s, -center.z * s);

  return s;
}

/** A soft radial gradient, used to fade the ground into the sky. No asset file. */
function radialFadeTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.34, "#d8d8d8");
    g.addColorStop(0.68, "#3c3c3c");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  // Non-colour data: must not be sRGB-decoded.
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

// --- the scene -----------------------------------------------------------

export function mountScene(
  container: HTMLElement,
  options: MountOptions = {},
): SceneHandle {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Renderer ------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = BEATS[0].exposure;
  // Without these two lines every `castShadow` flag on a mesh is inert. A
  // contact shadow is what makes the hero read as standing ON the floor rather
  // than hovering above it.
  //
  // Note: PCFSoftShadowMap still exists as an exported constant in three 0.186
  // but its implementation was removed — setting it warns and silently falls
  // back to PCFShadowMap. Use PCFShadowMap (the default) explicitly.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // 2. Scene, camera, sky --------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    BEATS[0].fov,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    200,
  );

  const sky = createSky();
  sky.setTo(BEATS[0]);
  scene.add(sky.mesh);

  // Exponential fog, re-tinted to the chapter's sky each frame. This is what
  // separates foreground from background: without it, distant geometry reads as
  // random dark shapes rather than depth.
  const fog = new THREE.FogExp2(new THREE.Color(0x05070d), 0.024);
  scene.fog = fog;

  // 3. Lighting ------------------------------------------------------------
  // A cheap ambient stand-in so unlit gaps never go fully black, plus a key and
  // a rim. Image-based lighting is generated from the sky further down.
  const hemi = new THREE.HemisphereLight(0xffffff, 0x0a0a12, 0.85);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffd9b0, 3.2);
  key.position.set(4, 7, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 26;
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  // Stops the low-bias self-shadowing acne a directional light causes on the
  // faceted hero mesh.
  key.shadow.bias = -0.0016;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const rim = new THREE.PointLight(0x7fb2ff, 12, 16, 2);
  rim.position.set(-3.2, 2.4, -2.6);
  scene.add(rim);

  // A warm fill from the camera side. Without it the hero's front face — the
  // one the camera actually sees in chapter 04 — sits in its own shadow.
  const fill = new THREE.PointLight(0xffc38f, 5.5, 12, 2);
  fill.position.set(2.6, 1.6, 2.4);
  scene.add(fill);

  // 4. Ground --------------------------------------------------------------
  const fade = radialFadeTexture();
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0e1219"),
    roughness: 0.58,
    metalness: 0.1,
    alphaMap: fade,
    transparent: true,
    envMapIntensity: 0.9,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(34, 96), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // A thin emissive ring on the floor. Reads as a deliberate stage rather than
  // a plane that happens to end, and picks up the chapter's glow colour.
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0.5,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const stageRings: THREE.Mesh[] = [];
  for (const [radius, opacity, tube] of [
    [6.4, 0.5, 0.012],
    [9.6, 0.22, 0.008],
  ] as const) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 8, 240),
      ringMaterial.clone(),
    );
    ring.material.opacity = opacity;
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    scene.add(ring);
    stageRings.push(ring);
  }

  // 5. Procedural subject --------------------------------------------------
  // Kept deliberately dependency-free: it is the one subject that can never
  // fail to load, so the page always has something to show.
  const orbGeometry = new THREE.IcosahedronGeometry(1, 24);
  const orbMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#7d8ea6"),
    metalness: 0.62,
    roughness: 0.2,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.35,
    // Emissive is faded out in the frame loop as the story moves on to the hero:
    // chapter 01's subject is self-lit, so it reads against a nearly black sky.
    emissive: new THREE.Color("#1d2c4d"),
    emissiveIntensity: 1,
    // The whole procedural subject dissolves as the camera commits to the hero,
    // so the two are never both solid in the same frame.
    transparent: true,
  });
  const orbUniforms: DisplacementUniforms = createDisplacementUniforms(0);
  orbMaterial.onBeforeCompile = (shader) => patchDisplacement(shader, orbUniforms);
  // Without a distinct cache key three may reuse a compiled program that lacks
  // our injected code.
  orbMaterial.customProgramCacheKey = () => "displaced-orb";

  const orb = new THREE.Mesh(orbGeometry, orbMaterial);
  orb.position.set(0, 1.62, 0);
  orb.name = "procedural-subject";
  scene.add(orb);

  // Orbiting shards, also procedural. Iridescent metal rather than flat black:
  // near-black on black gives no silhouette, so they read as noise.
  const shardGeometry = new THREE.TetrahedronGeometry(0.11, 0);
  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#8fa3c4"),
    metalness: 0.78,
    roughness: 0.18,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.7,
    transparent: true,
  });
  const shards = new THREE.Group();
  for (let i = 0; i < 14; i += 1) {
    const mesh = new THREE.Mesh(shardGeometry, shardMaterial);
    const angle = (i / 14) * Math.PI * 2;
    const radius = 2.35 + (i % 3) * 0.3;
    mesh.position.set(
      Math.cos(angle) * radius,
      1.62 + Math.sin(i * 1.7) * 0.55,
      Math.sin(angle) * radius,
    );
    mesh.rotation.set(i, i * 1.4, i * 0.6);
    // Elongated splinters read better than uniform blobs.
    mesh.scale.set(0.55 + (i % 4) * 0.1, 1.5 + (i % 5) * 0.35, 0.55 + (i % 3) * 0.12);
    shards.add(mesh);
  }
  scene.add(shards);

  // Track the sky colour so the fog always matches the horizon.
  const fogColor = new THREE.Color();

  const loader = new GLTFLoader();
  const mixers: THREE.AnimationMixer[] = [];
  const loadedRoots: THREE.Object3D[] = [];
  let disposed = false;
  let assetsLoaded = 0;
  let assetsFailed = 0;

  function trackDisposables(root: THREE.Object3D) {
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (material && "envMapIntensity" in material) {
          (material as THREE.MeshStandardMaterial).envMapIntensity = 1.15;
        }
      }
    });
  }

  const assetPromises: Promise<unknown>[] = [];

  // 6a. The hero: an animated, rigged model.
  assetPromises.push(
    loader
      .loadAsync("/models/Fox.glb")
      .then((gltf) => {
        if (disposed) return;
        const fox = gltf.scene;
        fitToHeight(fox, HERO_HEIGHT);
        trackDisposables(fox);
        scene.add(fox);
        loadedRoots.push(fox);
        assetsLoaded += 1;

        const mixer = new THREE.AnimationMixer(fox);
        const clip =
          THREE.AnimationClip.findByName(gltf.animations, "Walk") ?? gltf.animations[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        }
        mixers.push(mixer);
      })
      .catch(() => {
        assetsFailed += 1;
      }),
  );

  // 6b. Distant monoliths.
  //
  // These were originally built from the dismembered parts of a second rigged
  // model. That produced shapeless black blobs: unrelated body parts floating in
  // a ring do not read as architecture. A tapering prism does, for a fraction of
  // the geometry.
  const monolithGeometry = new THREE.CylinderGeometry(0.34, 0.62, 1, 5, 1);
  const monolithMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#48566e"),
    metalness: 0.6,
    roughness: 0.42,
    envMapIntensity: 1.1,
  });
  const monoliths = new THREE.Group();
  for (let i = 0; i < 11; i += 1) {
    const angle = (i / 11) * Math.PI * 2 + 0.35;
    const radius = 8.2 + (i % 3) * 2.1;
    const height = 2.4 + ((i * 7) % 5) * 1.5;

    const monolith = new THREE.Mesh(monolithGeometry, monolithMaterial);
    monolith.scale.set(1, height, 1);
    monolith.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
    monolith.rotation.y = angle * 1.7;
    monolith.rotation.z = (((i % 3) - 1) * Math.PI) / 90;
    monoliths.add(monolith);
  }
  scene.add(monoliths);
  loadedRoots.push(monoliths);

  // Environment lighting is generated from the sky shader, so it costs nothing
  // to download and can be re-tinted per chapter.
  //
  // To light the scene with a real HDRI instead, replace the block below with:
  //   const pmrem = new THREE.PMREMGenerator(renderer);
  //   const hdr = await new RGBELoader().loadAsync('/hdr/env.hdr');
  //   scene.environment = pmrem.fromEquirectangular(hdr).texture;
  // Three CC0 HDRIs are already in public/hdr/ (see ASSETS.md).
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(sky.mesh.clone());
    const envTarget = pmrem.fromScene(envScene, 0, 0.1, 100);
    scene.environment = envTarget.texture;
    pmrem.dispose();
  }

  // 7. Scroll -> scene state ----------------------------------------------
  const cameraPos = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  let currentFov = BEATS[0].fov;
  let currentFocus = 0;

  function readProgress(): number {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
  }

  function applyBeats(progress: number) {
    const last = BEATS.length - 1;
    const scaled = progress * last;
    const i = Math.min(Math.floor(scaled), last - 1);
    const raw = scaled - i;
    // Smoothstep between beats: no visible velocity discontinuity at a beat.
    const e = raw * raw * (3 - 2 * raw);

    const a: Beat = BEATS[i];
    const b: Beat = BEATS[i + 1];

    cameraPos.copy(toVec3(a.camera)).lerp(toVec3(b.camera), e);
    cameraTarget.copy(toVec3(a.target)).lerp(toVec3(b.target), e);
    camera.position.copy(cameraPos);
    camera.lookAt(cameraTarget);

    const fov = THREE.MathUtils.lerp(a.fov, b.fov, e);
    if (Math.abs(fov - currentFov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
      currentFov = fov;
    }

    renderer.toneMappingExposure = THREE.MathUtils.lerp(a.exposure, b.exposure, e);

    currentFocus = THREE.MathUtils.lerp(a.focus, b.focus, e);

    sky.applyLerp(a, b, e);
  }

  let smoothProgress = readProgress();
  applyBeats(smoothProgress);

  // 8. Resize --------------------------------------------------------------
  function resize() {
    const w = container.clientWidth;
    const h = Math.max(container.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // 9. Frame loop ----------------------------------------------------------
  let raf = 0;
  let lastTime = performance.now();
  const startTime = lastTime;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) {
      lastTime = now;
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const elapsed = (now - startTime) / 1000;

    const raw = readProgress();
    if (reduceMotion) {
      smoothProgress = raw;
    } else {
      // Frame-rate independent damping toward the true scroll position.
      smoothProgress += (raw - smoothProgress) * (1 - Math.exp(-CAMERA_DAMPING * dt));
    }
    applyBeats(smoothProgress);

    // Procedural subject: breathe, spin, and dissolve as the hero takes over.
    orbUniforms.uTime.value = elapsed;
    orbUniforms.uAmplitude.value = 0.15 + Math.sin(elapsed * 0.5) * 0.03 + (1 - currentFocus) * 0.05;
    orb.rotation.y = elapsed * 0.22;
    orb.rotation.x = Math.sin(elapsed * 0.31) * 0.14;
    orb.position.y = 1.62 + Math.sin(elapsed * 0.9) * 0.07;

    // The handoff. `currentFocus` goes 0 -> 1 across chapters 03-04, and a
    // single value drives opacity for the whole procedural group so the swap
    // reads as one deliberate transition instead of two objects colliding.
    const dissolve = THREE.MathUtils.clamp((currentFocus - 0.05) / 0.5, 0, 1);

    // While the hero panel covers the viewport (progress < ~0.35), the story
    // subjects pull back: dimmer and still, so the orange card and the
    // character art own the composition.
    const heroHold = 1 - THREE.MathUtils.smoothstep(smoothProgress, 0.3, 0.55);
    orbMaterial.envMapIntensity = 1.35 * (1 - heroHold * 0.75);

    orbMaterial.opacity = 1 - dissolve;
    orbMaterial.emissiveIntensity = 1 - dissolve;
    shardMaterial.opacity = 1 - dissolve;
    orb.visible = dissolve < 1;
    shards.visible = dissolve < 1 && heroHold < 0.98;
    orbMaterial.depthWrite = dissolve < 0.5;
    shardMaterial.depthWrite = dissolve < 0.5;

    shards.rotation.y = -elapsed * 0.12;
    shards.children.forEach((child, index) => {
      child.rotation.x += dt * (0.2 + index * 0.014);
      child.rotation.y += dt * (0.15 + index * 0.01);
    });

    // The hero idles until the camera commits to it, then walks.
    for (const mixer of mixers) {
      mixer.timeScale = (0.4 + currentFocus * 0.9) * (1 - heroHold * 0.85);
      mixer.update(dt);
    }

    sky.tick(elapsed, smoothProgress * 2);

    // Fog and stage rings track the chapter's horizon colour, so the ground
    // fades into whatever sky is on screen rather than into a fixed grey.
    fogColor.copy(sky.uniforms.uMid.value).lerp(sky.uniforms.uBottom.value, 0.55);
    fog.color.copy(fogColor);
    for (const ring of stageRings) {
      (ring.material as THREE.MeshBasicMaterial).color.copy(sky.uniforms.uGlow.value);
    }
    monoliths.rotation.y = elapsed * 0.015;

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  // 10. Report asset status once the network settles.
  Promise.allSettled(assetPromises).then(() => {
    if (disposed) return;
    options.onAssetsLoaded?.(assetsLoaded, assetsFailed);
  });
  options.onReady?.();

  // 11. Teardown -----------------------------------------------------------
  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();

      for (const mixer of mixers) mixer.stopAllAction();

      // Removing a node from the graph does not free its GPU buffers. Walk the
      // loaded models and dispose geometry + materials explicitly.
      for (const root of loadedRoots) {
        root.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) {
            if (!material) continue;
            for (const value of Object.values(material)) {
              if (value instanceof THREE.Texture) value.dispose();
            }
            material.dispose();
          }
        });
        scene.remove(root);
      }
      loadedRoots.length = 0;

      orbGeometry.dispose();
      orbMaterial.dispose();
      shardGeometry.dispose();
      shardMaterial.dispose();
      ground.geometry.dispose();
      groundMaterial.dispose();
      for (const ring of stageRings) {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      }
      monolithGeometry.dispose();
      monolithMaterial.dispose();
      fade.dispose();
      sky.mesh.geometry.dispose();
      (sky.mesh.material as THREE.Material).dispose();

      scene.environment?.dispose();
      scene.clear();

      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
