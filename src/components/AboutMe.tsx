"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const SKILLS = [
  {
    title: "API Security Research",
    detail: "Tracing trust breaks through request and response flows.",
    tags: ["REST", "GraphQL", "Auth"],
  },
  {
    title: "Source Code Review",
    detail: "Following assumptions from code to the security boundary.",
    tags: ["Review", "Logic", "Flow"],
  },
  {
    title: "Web Application Security",
    detail: "Testing the places where identity, access, and state meet.",
    tags: ["IDOR", "Access", "Logic"],
  },
  {
    title: "Reconnaissance & Attack Surface Mapping",
    detail: "Turning small signals into a clear attack-surface map.",
    tags: ["Recon", "OSINT", "Mapping"],
  },
  {
    title: "Security Automation",
    detail: "Building focused tools for repeatable, careful research.",
    tags: ["Scripts", "Tools", "Data"],
  },
  {
    title: "Vulnerability Reporting",
    detail: "Making technical findings useful for the people fixing them.",
    tags: ["PoC", "Impact", "Fixes"],
  },
] as const;

export default function AboutMe() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        section.dataset.revealed = "true";
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-title"
      className="about-me-section relative overflow-hidden bg-[#03050a] px-6 py-28 sm:px-10 sm:py-36 lg:px-20"
    >
      <div aria-hidden="true" className="about-me-grid absolute inset-0" />
      <div aria-hidden="true" className="about-me-orbit absolute -top-40 right-[-12rem] h-[34rem] w-[34rem] rounded-full border border-[#f2a35e]/10" />

      <div className="relative mx-auto max-w-7xl">
        <div className="about-me-copy grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-24">
          <div className="max-w-2xl">
            <p className="about-me-kicker font-mono text-[0.65rem] tracking-[0.32em] text-[#f2a35e]/75 uppercase">
              02 / Field Notes
            </p>
            <h2
              id="about-title"
              className="mt-5 text-5xl leading-[0.92] font-black tracking-[-0.05em] text-[#f7ede1] sm:text-7xl"
            >
              About Me
            </h2>

            <div className="mt-9 space-y-5 text-sm leading-7 text-[#f7ede1]/65 sm:text-base">
              <p>
                I&apos;m a 17-year-old independent bug hunter and security
                researcher. I spend my time reading requests, tracing trust
                boundaries, and looking for the moment an application believes
                the wrong thing.
              </p>
              <p>
                I hunt on HackerOne and build my own tools when a workflow
                needs more precision. API hunting and source-code hunting are
                my favorite places to work: one shows me what an application
                says, the other shows me what it assumes.
              </p>
              <p>
                When I&apos;m not testing, I&apos;m writing detailed reports, studying
                how systems fail, and turning small signals into evidence that
                developers can act on.
              </p>
            </div>

            <p className="about-me-signoff mt-9 max-w-xl font-mono text-sm leading-6 text-[#f2a35e] sm:text-base">
              Just a hacker who doesn&apos;t understand anything without hacking.
            </p>
          </div>

          <div className="about-me-terminal-wrap mx-auto w-full max-w-md lg:ml-auto">
            <div className="about-me-terminal-label mb-3 flex items-center justify-between font-mono text-[0.6rem] tracking-[0.22em] text-[#f2a35e]/65 uppercase">
              <span>rh2-1 / local terminal</span>
              <span>online</span>
            </div>
            <div className="about-me-terminal relative aspect-square overflow-hidden rounded-sm border border-[#f2a35e]/30 bg-[#08090d] p-5 sm:p-8">
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgb(242_163_94_/_0.055)_1px,transparent_1px),linear-gradient(90deg,rgb(242_163_94_/_0.055)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <div aria-hidden="true" className="about-me-terminal-scan absolute inset-x-0 top-0 h-24" />

              <svg
                aria-hidden="true"
                viewBox="0 0 420 340"
                className="about-me-terminal-art relative h-full w-full"
                fill="none"
              >
                <rect x="45" y="34" width="330" height="218" rx="8" stroke="currentColor" strokeWidth="2" />
                <path d="M45 76H375" stroke="currentColor" strokeWidth="2" />
                <circle cx="68" cy="55" r="5" fill="#ff5c3d" />
                <circle cx="86" cy="55" r="5" fill="#f2a35e" />
                <circle cx="104" cy="55" r="5" fill="#f7ede1" />
                <path d="m98 132 28 26-28 26M145 184h58" stroke="#f2a35e" strokeWidth="7" strokeLinecap="square" />
                <path d="M81 224h260M128 252h164" stroke="currentColor" strokeWidth="2" />
                <path d="M170 252v30m80-30v30M140 294h140" stroke="currentColor" strokeWidth="2" />
                <path d="M285 127h52M285 145h34M285 163h62" stroke="#f7ede1" strokeWidth="4" strokeLinecap="square" opacity="0.7" />
                <path d="M285 196h43M285 214h61" stroke="#f2a35e" strokeWidth="4" strokeLinecap="square" opacity="0.8" />
                <circle cx="334" cy="286" r="13" stroke="#ff5c3d" strokeWidth="3" />
                <path d="M334 278v16m-8-8h16" stroke="#ff5c3d" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="about-me-skills mt-24 sm:mt-32">
          <div className="flex flex-col justify-between gap-4 border-b border-[#f2a35e]/20 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[0.65rem] tracking-[0.32em] text-[#f2a35e]/70 uppercase">
                Toolkit / Curiosity
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#f7ede1] sm:text-4xl">
                Skills &amp; Technologies
              </h3>
            </div>
            <p className="max-w-xs font-mono text-xs leading-5 text-[#f7ede1]/45 sm:text-right">
              The tools change. The questions stay sharp.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((skill, index) => (
              <article
                key={skill.title}
                className="about-skill-card group relative overflow-hidden border border-[#f2a35e]/15 bg-[#08090d]/80 p-5"
                style={{ "--skill-index": index } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-sm font-bold tracking-wide text-[#f7ede1]">
                    {skill.title}
                  </h4>
                  <span className="font-mono text-[0.6rem] text-[#f2a35e]/50">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-3 min-h-10 text-xs leading-5 text-[#f7ede1]/48">
                  {skill.detail}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#f2a35e]/25 px-2 py-1 font-mono text-[0.6rem] tracking-wide text-[#f2a35e]/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
