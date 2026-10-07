import HoverReveal from "./HoverReveal";
import HeroStage from "./HeroStage";
import Link from "next/link";

const NAV = [
  { label: "Home", href: "/home" },
  { label: "About", href: "/about" },
  { label: "Writeups", href: "/writeups" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * The hero, laid out against the reference image:
 *
 *   - full-width orange panel inset from the page edges;
 *   - giant two-line headline behind the character;
 *   - character art standing on the panel, breaking out of the top edge;
 *   - vertical nav stack bottom-left, chapter index + tick top-right;
 *   - "Scroll Down" cue bottom-right;
 *   - hamburger glyph top-left.
 *
 * Z-order (bottom → top):
 *   1. panel background + circle motif
 *   2. headline
 *   3. HoverReveal (z-[5]) — above art, below all UI
 *   4. character stage (z-[6]) — interactive art with wind/blink/smoke
 *   5. chrome: nav, index, scroll cue, burger (z-10+)
 *
 * `min-h-[92vh]` keeps the composition proportions close to the reference
 * card while leaving the page scroll intact for the story below.
 */
export default function Hero() {
  return (
    <section
      id="home"
      aria-label="BUG-HUNTER hero"
      className="relative flex min-h-[92vh] items-stretch justify-center px-3 pt-3 sm:px-5 sm:pt-5"
    >
      <div className="relative flex w-full flex-col overflow-hidden bg-[#f2a35e] sm:rounded-md">
        {/* 1. Background motif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          <div className="absolute top-1/2 left-1/2 h-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="absolute top-1/2 left-1/2 h-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        </div>

        {/* 2. Headline behind everything */}
        <h1
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 z-[2] w-full -translate-x-1/2 -translate-y-1/2 text-center text-[17.5vw] leading-[0.82] font-black tracking-[0.02em] text-[#f7ede1] uppercase sm:text-[15vw]"
        >
          Bug
          <br />
          Hunter
        </h1>

        {/* 3. Cursor spotlight reveal — below all chrome */}
        <HoverReveal />

        {/* 4. The interactive character */}
        <HeroStage />

        {/* 5. Chrome */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-6 sm:p-8">
          {/* top row: burger + chapter index */}
          <div className="flex items-start justify-between">
            <button
              type="button"
              aria-label="Menu"
              className="pointer-events-auto flex w-9 cursor-pointer flex-col gap-[7px] p-1"
            >
              <span className="block h-[3px] w-6 self-end bg-[#fdf6ec]" />
              <span className="block h-[3px] w-4 self-end bg-[#fdf6ec]" />
            </button>

            <div className="text-right">
              <p className="font-mono text-lg font-semibold tracking-[0.18em] text-[#fdf6ec] sm:text-xl">
                RH2-1
              </p>
              <div className="mt-2 ml-auto h-10 w-px bg-[#fdf6ec]/80" />
            </div>
          </div>

          <div className="flex-1" />

          {/* bottom row: nav stack + scroll cue */}
          <div className="flex items-end justify-between">
            <nav aria-label="Primary" className="flex flex-col items-start gap-1.5">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="pointer-events-auto cursor-pointer text-lg font-extrabold tracking-[0.18em] text-[#f8d9b8]/80 uppercase transition-colors duration-200 hover:text-[#fff7ee] sm:text-xl"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <Link
              href="/gallery"
              className="pointer-events-auto cursor-pointer font-mono text-sm tracking-wide text-[#fdf6ec]/90 underline decoration-[#fdf6ec]/50 underline-offset-4 transition-colors hover:text-white"
            >
              Scroll Down
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
