/**
 * The story, and the scene state that goes with each chapter.
 *
 * This is the single file to edit if you want to rewrite the narrative: add,
 * remove or reorder entries in `CHAPTERS` and keep `BEATS` in step — one beat
 * per chapter, same order. Nothing else needs to know the count; the scroll
 * timeline is generated from these arrays.
 */

export type Vec3 = [number, number, number];

/** Where the camera should be, and what it should be looking at, per chapter. */
export type Beat = {
  /** Camera position in world units. */
  camera: Vec3;
  /** The point the camera looks at. */
  target: Vec3;
  /** 0 = watch the procedural subject, 1 = watch the animated GLB hero. */
  focus: number;
  /** Vertical field of view, in degrees. Dolly moves feel better with a push. */
  fov: number;
  /** Tone-mapping exposure. The scene gets brighter as the story resolves. */
  exposure: number;
  /** Sky gradient + glow colour for this chapter. */
  sky: { top: string; mid: string; bottom: string; glow: string };
};

export type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: "hero",
    eyebrow: "Chapter 01",
    title: "Arrive before you build",
    body:
      "Every project starts as a shape you can't quite see yet. This one is a sphere and a noise field — nothing borrowed, nothing loaded. Just geometry, and one rule about how far each point is allowed to move.",
  },
  {
    id: "form",
    eyebrow: "Chapter 02",
    title: "Push until it holds",
    body:
      "Displacement is easy to overdo. The interesting version is the one that keeps its silhouette while still looking like it's about to lose it. That tension is the whole design: a surface that reads as solid from any angle you throw at it.",
  },
  {
    id: "weight",
    eyebrow: "Chapter 03",
    title: "Give it weight",
    body:
      "Light is what turns geometry into an object. A sky gradient overhead, one warm source, and a floor that answers back. None of it is a texture map — the environment is a shader, so it shifts with the story instead of sitting still behind it.",
  },
  {
    id: "motion",
    eyebrow: "Chapter 04",
    title: "Let something move",
    body:
      "Then a real model walks on: rigged, animated, 163 KB, and openly licensed. It carries its own motion, so the scene can hand off from the abstract to the specific without the camera ever cutting.",
  },
  {
    id: "ship",
    eyebrow: "Chapter 05",
    title: "Ship it and keep it",
    body:
      "Two dependencies, one renderer, nothing between you and the pixels. Scroll back to the top and it replays — because the story is just a number between zero and one, and everything else is interpolation.",
  },
];

/**
 * One beat per chapter, hand-placed. The camera interpolates between adjacent
 * beats as you scroll, so a chapter's beat is reached when that chapter is
 * centred in the viewport.
 *
 * Chapter 0 is the hero panel: the 3D scene stays wide and quiet behind it so
 * the character art reads cleanly against the orange card. The story proper
 * starts at chapter 1 ("Push until it holds").
 */
export const BEATS: Beat[] = [
  {
    camera: [0.2, 2.3, 7.4],
    target: [0, 1.6, 0],
    focus: 0,
    fov: 42,
    exposure: 1.0,
    sky: { top: "#0a1024", mid: "#16233f", bottom: "#05070d", glow: "#6f8dff" },
  },
  {
    camera: [4.0, 2.0, 4.6],
    target: [0, 1.55, 0],
    focus: 0,
    fov: 38,
    exposure: 1.06,
    sky: { top: "#041a1c", mid: "#0d3a3a", bottom: "#030a0c", glow: "#4fe0c0" },
  },
  {
    camera: [-3.4, 4.2, 4.2],
    target: [0, 1.2, 0],
    focus: 0.15,
    fov: 46,
    exposure: 1.0,
    sky: { top: "#150a2b", mid: "#33165c", bottom: "#08040f", glow: "#b47cff" },
  },
  {
    camera: [2.2, 1.25, 2.9],
    target: [0, 0.62, 0],
    focus: 1,
    fov: 34,
    exposure: 1.12,
    sky: { top: "#1d0f1a", mid: "#4a2338", bottom: "#0d060b", glow: "#ffab6b" },
  },
  {
    camera: [0, 7.6, 7.0],
    target: [0, 0.9, 0],
    focus: 1,
    fov: 44,
    exposure: 1.16,
    sky: { top: "#0d1526", mid: "#24406b", bottom: "#070b14", glow: "#9fc4ff" },
  },
];

if (process.env.NODE_ENV !== "production" && CHAPTERS.length !== BEATS.length) {
  // Cheap guard so a copy edit can't silently desync the scroll timeline.
  console.warn(
    `[narrative] CHAPTERS (${CHAPTERS.length}) and BEATS (${BEATS.length}) must have the same length.`,
  );
}
