import * as THREE from "three";
import type { Beat } from "./narrative";

/**
 * The sky is a single inward-facing sphere with a gradient shader.
 *
 * It does double duty:
 *  1. it is the visible backdrop, and
 *  2. it is the scene's only image-based light source.
 *
 * Because it is a shader and not an .hdr file, the environment lighting can be
 * recoloured per chapter instead of being frozen at load time. The colours come
 * from `narrative.ts`, so re-tinting the whole story is a copy edit.
 *
 * Two things that matter for correctness:
 *  - Authored colours are sRGB hex. They are converted to linear working space
 *    so the renderer's output transform round-trips them faithfully.
 *  - `#include <tonemapping_fragment>` and `#include <colorspace_fragment>` are
 *    included manually. These are supplied automatically for three's built-in
 *    materials, but a raw ShaderMaterial must opt in or the sky will read
 *    darker and more saturated than every lit surface in front of it.
 */

const VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uBottom;
  uniform vec3 uGlow;
  uniform float uTime;
  uniform float uBand;
  varying vec3 vDir;

  void main() {
    vec3 dir = normalize(vDir);

    // Vertical gradient, bottom -> mid -> top.
    float h = dir.y * 0.5 + 0.5;
    vec3 col = mix(uBottom, uMid, smoothstep(0.0, 0.52, h));
    col = mix(col, uTop, smoothstep(0.48, 1.0, h));

    // A soft glow sitting behind the subject, biased slightly above the horizon.
    float glow = pow(max(0.0, 1.0 - abs(dir.x * 0.75)), 5.0)
               * pow(max(0.0, 1.0 - abs(dir.y - 0.12) * 1.7), 4.0);
    col += uGlow * glow * 0.55;

    // A faint drifting band so the sky is never perfectly static.
    float band = 1.0 - abs(fract(dir.y * 1.6 + uTime * 0.006 + uBand) - 0.5) * 2.0;
    col += uGlow * smoothstep(0.55, 1.0, band) * 0.07;

    gl_FragColor = vec4(col, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const SKY_RADIUS = 60;

export type Sky = {
  mesh: THREE.Mesh;
  uniforms: {
    uTop: { value: THREE.Color };
    uMid: { value: THREE.Color };
    uBottom: { value: THREE.Color };
    uGlow: { value: THREE.Color };
    uTime: { value: number };
    uBand: { value: number };
  };
  /**
   * Interpolates directly between two adjacent beats' palettes.
   *
   * Deliberately not an ease-toward-target: because the value is a pure
   * function of (a, b, t), scrolling backwards retraces the same colours
   * exactly instead of lagging behind.
   */
  applyLerp(a: Beat, b: Beat, t: number): void;
  /** Snaps straight to a chapter's palette. */
  setTo(beat: Beat): void;
  tick(elapsed: number, band: number): void;
};

/** Scratch colour set, allocated once per beat and reused every frame. */
type Palette = {
  top: THREE.Color;
  mid: THREE.Color;
  bottom: THREE.Color;
  glow: THREE.Color;
};

function toLinear(hex: string): THREE.Color {
  // THREE.Color.set() treats the input as sRGB working space by default; the
  // explicit conversion keeps the authored hex honest regardless of defaults.
  return new THREE.Color().setStyle(hex, THREE.SRGBColorSpace).convertSRGBToLinear();
}

export function createSky(): Sky {
  const uniforms = {
    uTop: { value: new THREE.Color(0, 0, 0) },
    uMid: { value: new THREE.Color(0, 0, 0) },
    uBottom: { value: new THREE.Color(0, 0, 0) },
    uGlow: { value: new THREE.Color(0, 0, 0) },
    uTime: { value: 0 },
    uBand: { value: 0 },
  };

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(SKY_RADIUS, 48, 32),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  mesh.name = "sky";
  mesh.frustumCulled = false;

  // Cache the linear-space conversion per beat. Converting four hex strings on
  // every frame would be pure waste, and the beats are a fixed-length array.
  const paletteCache = new Map<Beat, Palette>();

  function paletteFor(beat: Beat): Palette {
    let entry = paletteCache.get(beat);
    if (!entry) {
      entry = {
        top: toLinear(beat.sky.top),
        mid: toLinear(beat.sky.mid),
        bottom: toLinear(beat.sky.bottom),
        glow: toLinear(beat.sky.glow),
      };
      paletteCache.set(beat, entry);
    }
    return entry;
  }

  return {
    mesh,
    uniforms,
    setTo(beat) {
      const p = paletteFor(beat);
      uniforms.uTop.value.copy(p.top);
      uniforms.uMid.value.copy(p.mid);
      uniforms.uBottom.value.copy(p.bottom);
      uniforms.uGlow.value.copy(p.glow);
    },
    applyLerp(a, b, t) {
      const pa = paletteFor(a);
      const pb = paletteFor(b);
      const k = THREE.MathUtils.clamp(t, 0, 1);
      uniforms.uTop.value.copy(pa.top).lerp(pb.top, k);
      uniforms.uMid.value.copy(pa.mid).lerp(pb.mid, k);
      uniforms.uBottom.value.copy(pa.bottom).lerp(pb.bottom, k);
      uniforms.uGlow.value.copy(pa.glow).lerp(pb.glow, k);
    },
    tick(elapsed, band) {
      uniforms.uTime.value = elapsed;
      uniforms.uBand.value = band;
    },
  };
}
