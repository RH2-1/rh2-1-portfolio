"use client";

import { useEffect, useRef } from "react";

/**
 * The interactive character stage.
 *
 * The art is a single 2D cut-out, but it is rendered as a WebGL mesh so it can
 * be ALIVE — everything below runs on the three.js dependency that is already
 * in the project; no new packages:
 *
 *  - WIND: the vertex shader sways the hair region continuously. The sway is
 *    a sum of three sine gusts plus a per-cell random phase, so individual
 *    spikes move out of sync instead of waving like a flag.
 *  - BLINK: the fragment shader blends the two eye ellipses toward the sampled
 *    skin tone on a ~2 s cycle (a fast close-open pulse). For flat 2D art this
 *    reads as a natural lid-closing and is far more robust than warping UVs.
 *  - SMOKE: GPU particles (THREE.Points) rise from the cigarette tip with a
 *    swaying drift; the ember at the tip pulses in the fragment shader and the
 *    hand/stick region gets a subtle idle wiggle.
 *  - PARALLAX: pointer position tilts and shifts the character in 3D, which is
 *    what sells "model" rather than "picture". An idle float keeps it moving
 *    even with no mouse.
 *
 * The chest print is part of the generated art itself (white "H1" on the
 * orange tee), so no overlay is needed.
 *
 * Eye/cigarette coordinates were measured from the actual asset in pixel space
 * and converted to UV space (UV origin bottom-left; image y grows downward):
 *   eyeL (0.452, 0.634)   eyeR (0.567, 0.641)   cigTip (0.900, 0.659)
 *   hair band uv.y ∈ [0.56, 0.96], skin tone #fdddd0
 */

const IMG = "/hero/hero.webp";
const IMG_ASPECT = 1567 / 1600;

const EYE_L: [number, number] = [0.452, 0.634];
const EYE_R: [number, number] = [0.567, 0.641];
const EYE_RADII: [number, number] = [0.03, 0.015];
const CIG_TIP: [number, number] = [0.9, 0.659];

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // --- hair wind -------------------------------------------------------
    // Weight: hair band at the top of the image, fading at the crown and
    // avoiding the face below. Smoke at the top-right gets carried too, which
    // is physically right anyway.
    float band = smoothstep(0.54, 0.68, uv.y) * (1.0 - smoothstep(0.90, 0.985, uv.y));
    band *= smoothstep(0.03, 0.14, uv.x) * (1.0 - smoothstep(0.86, 0.985, uv.x));

    // Layered gusts + per-cell phase so spikes move independently.
    float gust =
      sin(uTime * 1.7 + uv.y * 4.0) * 0.50 +
      sin(uTime * 2.9 + uv.y * 9.0 + 1.7) * 0.30 +
      sin(uTime * 0.6) * 0.20;
    float cell = hash(floor(uv * vec2(42.0, 30.0)));
    float sway = gust * (0.55 + 0.45 * sin(uTime * 1.15 + cell * 6.2831));

    pos.x += band * sway * 0.05 * uWind;
    pos.y += band * sway * 0.012 * uWind; // slight lift, spikes feel buoyant

    // --- cigarette hand idle wiggle --------------------------------------
    vec2 cigC = vec2(0.86, 0.64);
    float cigW = smoothstep(0.16, 0.02, distance(uv, cigC));
    pos.x += cigW * sin(uTime * 2.3) * 0.006 * uWind;
    pos.y += cigW * sin(uTime * 3.1 + 1.0) * 0.004 * uWind;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uBlink;
  uniform vec2 uEyeL;
  uniform vec2 uEyeR;
  uniform vec2 uEyeRadii;
  uniform vec2 uCigTip;
  uniform vec3 uSkin;
  varying vec2 vUv;

  float eyeMask(vec2 uv, vec2 c) {
    vec2 d = (uv - c) / uEyeRadii;
    return smoothstep(1.0, 0.45, length(d));
  }

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // Feather the binary cut-out alpha slightly to kill the hard halo edge.
    float alpha = smoothstep(0.04, 0.42, tex.a);
    if (alpha < 0.004) discard;

    vec3 col = tex.rgb;

    // --- blink -------------------------------------------------------------
    float em = max(eyeMask(vUv, uEyeL), eyeMask(vUv, uEyeR)) * uBlink;
    // Two-step lid: skin tone, then a soft lash line as it reopens.
    col = mix(col, uSkin, em * 0.96);
    float lash = em * smoothstep(0.35, 0.9, eyeMask(vUv, mix(uEyeL, uEyeR, 0.5)) * 0.0 + em);
    col *= 1.0 - lash * 0.18;

    // --- ember glow at the cigarette tip ------------------------------------
    float dTip = length((vUv - uCigTip) / vec2(0.016, 0.012));
    float flicker = 0.55 + 0.45 * sin(uTime * 6.3) * sin(uTime * 4.1 + 1.3);
    col += vec3(1.0, 0.42, 0.12) * smoothstep(1.0, 0.0, dTip) * flicker * 0.55;

    gl_FragColor = vec4(col, alpha);
  }
`;

const SMOKE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeightPx;
  attribute float aSeed;
  varying float vLife;

  void main() {
    float speed = 0.16 + aSeed * 0.07;
    float life = fract(uTime * speed + aSeed);
    vLife = life;

    float rise = mix(0.655, 0.97, life);
    float drift =
      sin(life * 7.0 + aSeed * 40.0) * 0.035 * life +
      sin(uTime * 0.9) * 0.012 * life;
    float x = 0.9 + drift + (aSeed - 0.5) * 0.02 * life;

    vec2 xy = vec2(x * 2.0 - 1.0, rise * 2.0 - 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(xy, 0.0, 1.0);

    float size = mix(10.0, 64.0, life) * uPixelRatio;
    gl_PointSize = size * (uHeightPx / 900.0);
  }
`;

const SMOKE_FRAG = /* glsl */ `
  varying float vLife;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disk = smoothstep(0.5, 0.12, d);
    float alpha = disk * smoothstep(0.0, 0.15, vLife) * (1.0 - vLife) * 0.30;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vec3(0.86, 0.83, 0.80), alpha);
  }
`;

export default function HeroStage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hostEl = hostRef.current;
    if (!hostEl) return;

    const host = hostEl;

    // Static-image fallback when WebGL is unavailable.
    let supported = false;
    try {
      const probe = document.createElement("canvas");
      supported = Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
    } catch {
      supported = false;
    }
    if (!supported) {
      const img = document.createElement("img");
      img.src = IMG;
      img.alt = "";
      img.draggable = false;
      img.style.cssText =
        "position:absolute;inset:0;margin:auto;height:100%;width:auto;object-fit:contain;";
      host.appendChild(img);
      return;
    }

    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const texture = new THREE.TextureLoader().load(IMG);
      texture.colorSpace = THREE.SRGBColorSpace;

      // --- character mesh ---------------------------------------------------
      const uniforms = {
        uMap: { value: texture },
        uTime: { value: 0 },
        uWind: { value: reduceMotion ? 0 : 1 },
        uBlink: { value: 0 },
        uEyeL: { value: new THREE.Vector2(...EYE_L) },
        uEyeR: { value: new THREE.Vector2(...EYE_R) },
        uEyeRadii: { value: new THREE.Vector2(...EYE_RADII) },
        uCigTip: { value: new THREE.Vector2(...CIG_TIP) },
        uSkin: { value: new THREE.Color("#fdddd0") },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 96, 96), material);
      mesh.scale.x = IMG_ASPECT;
      scene.add(mesh);

      // --- smoke particles ---------------------------------------------------
      const COUNT = 26;
      const seeds = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i += 1) seeds[i] = Math.random();
      const smokeGeometry = new THREE.BufferGeometry();
      smokeGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
      smokeGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      const smokeUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uHeightPx: { value: 800 },
      };
      const smokeMaterial = new THREE.ShaderMaterial({
        uniforms: smokeUniforms,
        vertexShader: SMOKE_VERT,
        fragmentShader: SMOKE_FRAG,
        transparent: true,
        depthWrite: false,
      });
      const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
      smoke.scale.x = IMG_ASPECT;
      smoke.renderOrder = 2;
      scene.add(smoke);

      // --- sizing ------------------------------------------------------------
      function resize() {
        const w = Math.max(host.clientWidth, 1);
        const h = Math.max(host.clientHeight, 1);
        renderer.setSize(w, h, false);
        camera.left = -(w / h);
        camera.right = w / h;
        camera.updateProjectionMatrix();
        smokeUniforms.uHeightPx.value = h;
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // --- pointer parallax on the whole hero panel --------------------------
      const panel = host.parentElement ?? host;
      const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
      function onMove(event: PointerEvent) {
        const rect = panel.getBoundingClientRect();
        parallax.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        parallax.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      }
      function onLeave() {
        parallax.tx = 0;
        parallax.ty = 0;
      }
      if (!reduceMotion) {
        panel.addEventListener("pointermove", onMove);
        panel.addEventListener("pointerleave", onLeave);
      }

      // --- frame loop ---------------------------------------------------------
      const start = performance.now();
      let raf = 0;
      let last = start;
      let nextBlink = 2.0;
      let blinkStart = -10;

      function frame(now: number) {
        raf = requestAnimationFrame(frame);
        if (document.hidden) {
          last = now;
          return;
        }
        const t = (now - start) / 1000;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        // Blink scheduler: a ~160 ms close-open pulse roughly every 2 s.
        if (t >= nextBlink) {
          blinkStart = t;
          nextBlink = t + 1.75 + Math.random() * 0.6;
        }
        const bp = (t - blinkStart) / 0.16;
        uniforms.uBlink.value = bp >= 0 && bp <= 1 ? Math.sin(bp * Math.PI) : 0;

        uniforms.uTime.value = t;
        smokeUniforms.uTime.value = t;

        // Parallax + idle float.
        const k = 1 - Math.exp(-6 * dt);
        parallax.x += (parallax.tx - parallax.x) * k;
        parallax.y += (parallax.ty - parallax.y) * k;
        mesh.rotation.y = parallax.x * 0.12;
        mesh.rotation.x = parallax.y * 0.06;
        mesh.position.y = reduceMotion ? 0 : Math.sin(t * 0.8) * 0.012;
        mesh.position.x = parallax.x * 0.05;
        smoke.position.copy(mesh.position);
        smoke.rotation.copy(mesh.rotation);

        renderer.render(scene, camera);
      }

      if (reduceMotion) {
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(frame);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        panel.removeEventListener("pointermove", onMove);
        panel.removeEventListener("pointerleave", onLeave);
        smokeGeometry.dispose();
        smokeMaterial.dispose();
        mesh.geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })().catch(() => {
      // Loader/import failure: fall back to the static image.
      const img = document.createElement("img");
      img.src = IMG;
      img.alt = "";
      img.style.cssText = "position:absolute;inset:0;margin:auto;height:100%;object-fit:contain;";
      host.appendChild(img);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-hero-stage=""
      className="pointer-events-none absolute right-[4%] bottom-0 z-[6] h-[88%] w-[min(52vw,620px)] sm:right-[6%]"
    />
  );
}
