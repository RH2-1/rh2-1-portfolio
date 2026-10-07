"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WRITEUPS, type Writeup } from "@/lib/archive";

/**
 * VULNERABILITY RESEARCH — an interactive digital archive.
 *
 * Deep-black field-journal section: oversized "WRITEUPS" typography with a
 * per-character scramble-in, a short introduction, then an asymmetric
 * editorial grid of six world cards. Cards reveal with a "decryption"
 * animation — each plate un-redacts from a corrupted state as it scrolls
 * into view: char-blocks dissolve, an amber scan bar crosses, the ghost
 * image splits and snaps into register. Floating words drift on scroll
 * parallax; a cursor-following inspection grid lights up the plates.
 *
 * Motion model:
 *   - reveal-once flags via IntersectionObserver + CSS (staggered);
 *   - ONE rAF loop drives per-card scroll-scrubbed decryption progress,
 *     floating-word parallax and the inspection spotlight — writing CSS
 *     vars directly, never React state.
 *   - Desktop (pointer:fine) gets the full treatment; touch gets reveals
 *     without the pointer effects; prefers-reduced-motion gets everything
 *     static and readable.
 */

export default function Archive() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const wordsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const [selected, setSelected] = useState<Writeup | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  // -------------------------------------------------------------- mixins
  // Per-character scramble for the big heading.
  useEffect(() => {
    const head = headRef.current;
    if (!head) return;
    const chars = Array.from(head.querySelectorAll<HTMLElement>("[data-ch]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      chars.forEach((c) => {
        c.textContent = c.dataset.ch ?? "";
        c.dataset.done = "true";
      });
      head.dataset.done = "true";
      return;
    }

    let played = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || played) return;
        played = true;
        io.disconnect();

        const GLYPHS = "▓▒░#@%&$?!01<>/\\|";
        const finalText = chars.map((c) => c.dataset.ch ?? "").join("");
        chars.forEach((c, i) => {
          const t0 = i * 34;
          const hold = 8; // frames of scramble per char
          let f = 0;
          const tick = () => {
            if (f < hold) {
              c.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              c.dataset.done = "false";
              f += 1;
              requestAnimationFrame(tick);
            } else {
              c.textContent = c.dataset.ch ?? "";
              c.dataset.done = "true";
            }
          };
          setTimeout(() => requestAnimationFrame(tick), t0);
          void finalText;
        });
        head.dataset.done = "true";
      },
      { threshold: 0.3 },
    );
    io.observe(head);
    return () => io.disconnect();
  }, []);

  // -------------------------------------------------------------- scroll loop
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce) {
      section.dataset.revealed = "true";
      return;
    }

    // Reveal flags (once per card, staggered by --i in CSS).
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        section.dataset.revealed = "true";
        io.disconnect();
      },
      { threshold: 0.1 },
    );
    io.observe(section);

    const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
    const words = wordsRef.current.filter(Boolean) as HTMLSpanElement[];

    let raf = 0;
    let mx = -1;
    let my = -1;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    if (fine) section.addEventListener("mousemove", onMove, { passive: true });

    function frame() {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const vh = window.innerHeight;

      // Per-card scroll-scrubbed "decryption" progress.
      for (let i = 0; i < cards.length; i += 1) {
        const el = cards[i];
        const r = el.getBoundingClientRect();
        if (r.bottom < -60 || r.top > vh + 60) continue;
        // 0 when the card's top crosses the fold, 1 by 45% up the viewport.
        const t = Math.min(Math.max((vh * 0.88 - r.top) / (vh * 0.45), 0), 1);
        const e = t * t * (3 - 2 * t);
        el.style.setProperty("--dec", e.toFixed(4));

        // pointer-driven inspection spotlight (desktop only)
        if (fine && mx >= 0) {
          el.style.setProperty("--mx", `${((mx / window.innerWidth) * 100).toFixed(2)}%`);
          el.style.setProperty("--my", `${((my / window.innerHeight) * 100).toFixed(2)}%`);
        }
      }

      // Floating words: slow scroll parallax drift.
      for (let i = 0; i < words.length; i += 1) {
        const el = words[i];
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
        el.style.transform = `translate3d(0, ${(t * (i % 2 === 0 ? -46 : 38)).toFixed(1)}px, 0) rotate(${(t * (i % 2 === 0 ? -2.4 : 1.8)).toFixed(2)}deg)`;
      }
    }
    raf = raf || requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="writeups"
      aria-label="Vulnerability research — a digital archive"
      data-archive=""
      className="relative overflow-hidden bg-black py-28 sm:py-36"
    >
      {/* Field-journal frame: hairline vertical rules at the page gutters. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 hidden w-px bg-white/[0.06] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 hidden w-px bg-white/[0.06] lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        {/* ---------------------------------------------------------- */}
        {/* Heading block — centered                                    */}
        {/* ---------------------------------------------------------- */}
        <div className="relative flex flex-col items-center text-center">
          <p className="arc-fade flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] text-[#f2a35e] uppercase" style={{ ["--fd" as string]: "0ms" }}>
            <span aria-hidden="true" className="block h-px w-10 bg-[#f2a35e]/60" />
            Field journal — vol. II
          </p>

          <h2
            ref={headRef}
            data-head=""
            className="mt-6 text-center text-[16vw] leading-[0.82] font-black tracking-[0.01em] text-[#f7ede1] uppercase sm:text-[13vw] lg:text-[11rem]"
          >
            {"Writeups".split("").map((ch, i) => (
              <span key={i} data-ch={ch} className="arc-ch">
                {ch}
              </span>
            ))}
            <span
              aria-hidden="true"
              className="ml-3 hidden align-top font-mono text-[0.14em] leading-none font-normal tracking-[0.35em] text-white/30 sm:ml-5 sm:inline-block"
            >
              / vulnerability
              <br />
              &nbsp;&nbsp;research
            </span>
          </h2>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="arc-fade max-w-xl text-base leading-relaxed text-white/60 sm:text-lg" style={{ ["--fd" as string]: "160ms" }}>
              Security research is rarely about the obvious path. I examine how
              applications authenticate users, enforce authorization, and handle
              state — then turn reproducible behavior into clear, actionable
              findings.
            </p>
            <p className="arc-fade shrink-0 font-mono text-[11px] leading-relaxed tracking-[0.25em] text-white/35 uppercase" style={{ ["--fd" as string]: "320ms" }}>
              Entries: 05
              <br />
              Status: curated
              <br />
              Clearance: public
            </p>
          </div>

          <div className="arc-fade mt-12 h-px w-full bg-gradient-to-r from-transparent via-[#f2a35e]/50 to-transparent" style={{ ["--fd" as string]: "420ms" }} />
        </div>
      <ol className="mt-16 grid grid-cols-1 gap-14 sm:mt-20 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        {WRITEUPS.map((w, i) => (
          <li key={w.code} className={`arc-item ${w.layout} ${w.offset}`}>
            <button
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              type="button"
              onClick={() => setSelected(w)}
              data-plx={w.plx}
              aria-label={`Open writeup: ${w.title}`}
              className={`arc-card group block cursor-pointer text-left ${w.mobile} mx-auto sm:mx-0 lg:mx-auto`}
              style={{ ["--rot" as string]: `${w.rot}deg`, ["--i" as string]: i }}
            >
              {/* plate */}
              <div
                className={`relative overflow-hidden rounded-sm border border-white/10 bg-[#0b0b0e] ${w.aspect} transition-colors duration-500 group-hover:border-[#f2a35e]/50`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.img}
                  alt={w.alt}
                  loading="lazy"
                  draggable={false}
                  className="arc-plate absolute inset-0 h-full w-full object-cover"
                />
                {/* amber phosphor tint + crisp pixel rendering */}
                <span aria-hidden="true" className="arc-plate-tint absolute inset-0" />
                {/* decryption: char-block dissolve + amber scan bar */}
                <span aria-hidden="true" className="arc-dec" />
                {/* inspection grid (follows the pointer, desktop) */}
                <span aria-hidden="true" className="arc-inspect" />
                {/* scan bar on hover */}
                <span aria-hidden="true" className="arc-scanbar" />

                {/* corner ticks — appear on hover */}
                <span
                  aria-hidden="true"
                  className="absolute top-2 left-2 h-3 w-3 border-t border-l border-[#f2a35e]/0 transition-all duration-500 group-hover:border-[#f2a35e]/80"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-2 bottom-2 h-3 w-3 border-r border-b border-[#f2a35e]/0 transition-all duration-500 group-hover:border-[#f2a35e]/80"
                />

                {/* catalog code chip */}
                <span className="absolute top-3 right-3 border border-white/15 bg-black/55 px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-white/55 backdrop-blur-sm transition-colors duration-500 group-hover:border-[#f2a35e]/50 group-hover:text-[#f2a35e]">
                  {w.code}
                </span>

                {/* habitat line — the small detail that appears on hover */}
                <span className="absolute bottom-3 left-3 translate-y-2 font-mono text-[9px] tracking-[0.28em] text-[#f2a35e]/0 uppercase transition-all duration-500 group-hover:translate-y-0 group-hover:text-[#f2a35e]/90">
                  {w.habitat}
                </span>
              </div>

              {/* caption block */}
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="text-xl leading-tight font-bold tracking-tight text-[#f7ede1] transition-colors duration-300 group-hover:text-white sm:text-2xl">
                  {w.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="font-mono text-[10px] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#ff5c3d] text-white/25 tracking-[0.3em] uppercase"
                >
                  №{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] tracking-[0.26em] text-[#f2a35e]/70 uppercase">
                {w.category}
                <span className="arc-cat-dot" aria-hidden="true" />
              </p>
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-white/55 transition-colors duration-300 group-hover:text-white/70">
                {w.desc}
              </p>
            </button>
          </li>
        ))}
      </ol>

        {/* ---------------------------------------------------------- */}
        {/* Floating oversized words + metadata labels                 */}
        {/* ---------------------------------------------------------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span
            ref={(el) => {
              wordsRef.current[0] = el;
            }}
            className="float-word top-[6%] -left-6 text-[19vw] sm:-left-10 lg:text-[15rem]"
          >
            unexplored
          </span>
        <span
          ref={(el) => {
            wordsRef.current[1] = el;
          }}
          className="float-word top-[46%] -right-8 text-[16vw] sm:-right-12 lg:text-[12rem]"
        >
          disclose
        </span>
        <span
          ref={(el) => {
            wordsRef.current[2] = el;
          }}
          className="float-word bottom-[22%] left-[2%] text-[15vw] lg:text-[10rem]"
        >
          observe
          <span className="arc-live" aria-hidden="true" />
        </span>

          <span className="meta-label top-[38%] left-[1%] hidden lg:block">
            fig. 06 — plates, 1-bit
          </span>
          <span className="meta-label top-[24%] cursor-default hidden lg:block">
            lat 23.8103 / lon 90.4125
          </span>
          <span className="meta-label bottom-[10%] right-[6%] hidden sm:block">
            ██-classified → released
          </span>
          <span className="meta-label top-[78%] left-[38%] hidden xl:block">
            do not feed the payloads
          </span>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* CTA                                                        */}
        {/* ---------------------------------------------------------- */}
        <div className="relative mt-28 flex justify-center sm:mt-36">
          <Link
            href="/projects/rh2-enum"
            className="arc-cta group relative inline-flex items-center gap-4 border border-[#f2a35e]/50 px-8 py-4 font-mono text-xs tracking-[0.4em] text-[#f2a35e] uppercase transition-all duration-500 hover:border-[#f2a35e] hover:bg-[#f2a35e]/10 hover:text-white sm:px-12 sm:py-5 sm:text-sm"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[#f2a35e]/0 transition-colors duration-500 group-hover:bg-[#f2a35e]/[0.06]"
            />
            My GitHub Projects
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-500 group-hover:translate-x-2"
            >
              →
            </span>
          </Link>
        </div>
      </div>

      {selected ? (
        <div
          className="writeup-dialog fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#03050a]/90 p-2 backdrop-blur-md sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="writeup-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <article className="writeup-panel relative overflow-hidden border border-[#f2a35e]/35 bg-[#08090d] shadow-[0_0_80px_rgba(242,163,94,0.12)]">
            <button
              type="button"
              aria-label="Close writeup"
              onClick={() => setSelected(null)}
              className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center border border-white/20 font-mono text-lg text-white/65 transition hover:border-[#f2a35e] hover:text-[#f2a35e]"
            >
              ×
            </button>

            <div className="writeup-panel-grid grid h-full lg:grid-cols-[0.82fr_1.18fr]">
              <div className="relative min-h-64 overflow-hidden border-b border-white/10 lg:min-h-0 lg:border-r lg:border-b-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.img} alt={selected.alt} className="h-full w-full object-cover opacity-70 grayscale-[0.2]" />
                <div aria-hidden="true" className="writeup-panel-scan absolute inset-0" />
                <div className="absolute inset-x-6 bottom-6">
                  <p className="font-mono text-[10px] tracking-[0.35em] text-[#f2a35e] uppercase">{selected.code}</p>
                  <p className="mt-3 max-w-[18ch] text-4xl leading-[0.9] font-black tracking-tight text-[#f7ede1] uppercase sm:text-5xl">{selected.title}</p>
                </div>
              </div>

              <div className="writeup-panel-content overflow-y-auto p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase">
                  <span className="text-[#f2a35e]">{selected.category}</span>
                  <span>Status: {selected.status}</span>
                  <span>Severity: {selected.severity}</span>
                </div>
                <h2 id="writeup-dialog-title" className="sr-only">{selected.title}</h2>
                <section className="mt-8 border-l-2 border-[#f2a35e] pl-4">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">The finding</h3>
                  <p className="mt-3 text-xl leading-relaxed text-[#f7ede1] sm:text-2xl">{selected.finding}</p>
                </section>

                <section className="mt-8">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Executive summary</h3>
                  <p className="mt-3 text-base leading-relaxed text-white/65">{selected.summary}</p>
                </section>

                <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Background</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.background}</p>
                  </section>
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">How I found it</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.discovery}</p>
                  </section>
                </div>

                <section className="mt-10 border-t border-white/10 pt-8">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Attack path</h3>
                  <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                    {selected.attackPath.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-white/65">
                        <span className="font-mono text-[#f2a35e]">0{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="mt-10 border-t border-white/10 pt-8">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Technical deep dive</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.technical}</p>
                  <pre className="mt-5 overflow-x-auto border border-white/10 bg-black/60 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-[#f2a35e]/80"><code>{selected.requestSnippet}</code></pre>
                </section>

                <section className="mt-10 border-t border-white/10 pt-8">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Challenges & controls</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.challenge}</p>
                </section>

                <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Impact</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.impact}</p>
                  </section>
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Classification</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="border border-white/15 px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-white/55 uppercase">{tag}</span>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="mt-10 border-t border-white/10 pt-8">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Key takeaways</h3>
                  <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-white/65 sm:grid-cols-3">
                    {selected.takeaways.map((item) => <li key={item} className="border-t border-[#f2a35e]/35 pt-3">{item}</li>)}
                  </ul>
                </section>

                <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Root cause</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.rootCause}</p>
                  </section>
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Testing boundary</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.scopeNote}</p>
                  </section>
                </div>

                <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Evidence shape</h3>
                    <ul className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">
                      {selected.evidence.map((item) => <li key={item} className="border-l border-[#f2a35e]/45 pl-3">{item}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-mono text-[10px] tracking-[0.3em] text-[#f2a35e] uppercase">Remediation</h3>
                    <ul className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">
                      {selected.remediation.map((item) => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
