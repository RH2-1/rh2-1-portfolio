import * as THREE from "three";

/**
 * A MeshPhysicalMaterial with a curl-free noise displacement baked into the
 * vertex stage.
 *
 * Why this shape instead of ShaderMaterial: we keep every feature of the
 * standard PBR pipeline (environment reflections, tone mapping, fog, shadows)
 * and only inject the displacement. That means the object is lit by the same
 * sky that lights the loaded GLB — the procedural and the real subject match.
 *
 * Two details that are easy to get wrong, both fixed here:
 *  - `beginnormal_vertex` runs BEFORE `begin_vertex` in three's vertex shader,
 *    so the offset is computed there and the analytic normal is written into
 *    `objectNormal`, which `defaultnormal_vertex` then transforms for us.
 *  - The displaced position must also be applied to `transformed`, otherwise
 *    the surface moves but the shadows and depth prepass do not.
 */

const VERTEX_PARS = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uPhase;

  // Ashima simplex noise (3D). Public domain / MIT, inlined so the project
  // needs no extra dependency just to get a noise function.
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Displacement amount for a unit-sphere direction. Public so the normal
  // derivation below stays in exact agreement with the applied offset.
  float displaceAt(vec3 dir) {
    float n = snoise(dir * uFrequency + vec3(0.0, 0.0, uTime * 0.18 + uPhase));
    float ridge = snoise(dir * uFrequency * 2.15 + vec3(uPhase, uTime * 0.11, 0.0));
    return (n * 0.75 + ridge * 0.25) * uAmplitude;
  }

  // Analytic normal: offset the two tangent directions and cross the result.
  // Cheaper and far more stable than re-deriving from the flat-shaded noise.
  vec3 displacedNormal(vec3 dir, vec3 tangent, vec3 bitangent, float h) {
    float eps = 0.035;
    vec3 dirT = normalize(dir + tangent * eps);
    vec3 dirB = normalize(dir + bitangent * eps);

    vec3 pT = dirT * (1.0 + displaceAt(dirT) / max(h, 0.0001));
    vec3 pB = dirB * (1.0 + displaceAt(dirB) / max(h, 0.0001));

    return normalize(cross(pT - dir, pB - dir));
  }
`;

/** Inject the displacement into the standard vertex shader. */
export function patchDisplacement(
  shader: THREE.WebGLProgramParametersWithUniforms,
  uniforms: Record<string, THREE.IUniform>,
) {
  for (const key of Object.keys(uniforms)) {
    shader.uniforms[key] = uniforms[key];
  }

  shader.vertexShader = `uniform float uRadius;\n${shader.vertexShader}`;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `#include <common>\n${VERTEX_PARS}`,
  );

  // Runs before begin_vertex, so `objectNormal` already holds the displaced
  // normal by the time three transforms it.
  shader.vertexShader = shader.vertexShader.replace(
    "#include <beginnormal_vertex>",
    /* glsl */ `
      vec3 nDir = normalize(position);
      vec3 nTangent = normalize(cross(nDir, abs(nDir.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
      vec3 nBitangent = normalize(cross(nDir, nTangent));
      float nOffset = displaceAt(nDir);
      float nHeight = uRadius + nOffset;
      vec3 nDisplacedDir = normalize(nDir * nHeight);
      #include <beginnormal_vertex>
      objectNormal = displacedNormal(nDir, nTangent, nBitangent, nHeight);
      #ifdef USE_TANGENT
        objectTangent = normalize(cross(nBitangent, objectNormal));
      #endif
    `,
  );

  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    /* glsl */ `
      #include <begin_vertex>
      transformed = nDisplacedDir;
    `,
  );
}

/** Uniform set for one procedural subject. */
export function createDisplacementUniforms(seed = 0) {
  return {
    uTime: { value: 0 },
    uAmplitude: { value: 0.16 },
    uFrequency: { value: 1.55 },
    uPhase: { value: seed },
    uRadius: { value: 1 },
  };
}

export type DisplacementUniforms = ReturnType<typeof createDisplacementUniforms>;
