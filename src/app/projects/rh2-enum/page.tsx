import Link from "next/link";

const MODULES = [
  ["01", "Request parser", "Turns a captured request into a reusable target while preserving method, headers, body, and placeholders."],
  ["02", "Baseline engine", "Learns normal response fingerprints before comparing candidate inputs against the target's own behavior."],
  ["03", "Response analysis", "Measures status, length, words, lines, headers, timing, similarity, and precise character differences."],
  ["04", "Timing layer", "Uses repeated samples, outlier filtering, adaptive thresholds, and delta reporting for timing-based signals."],
  ["05", "Thread engine", "Runs bounded concurrent candidate checks while keeping the output structured and readable."],
  ["06", "Evidence output", "Explains why a candidate differs instead of returning an opaque yes/no result."],
];

export const metadata = {
  title: "RH2 Enum — Security Research Toolkit",
  description: "A focused Python framework for authentication analysis and response-difference research.",
};

export default function RH2EnumPage() {
  return (
    <main className="rh2-project-page min-h-screen bg-[#03050a] text-[#f7ede1]">
      <section className="rh2-project-hero relative flex min-h-[92svh] items-end overflow-hidden px-6 py-8 sm:px-10 lg:px-20">
        <div aria-hidden="true" className="rh2-project-grid absolute inset-0" />
        <div aria-hidden="true" className="rh2-project-orbit absolute top-[12%] right-[8%] h-[42vw] w-[42vw] rounded-full border border-[#f2a35e]/20" />
        <div aria-hidden="true" className="rh2-project-orbit rh2-project-orbit--small absolute top-[20%] right-[16%] h-[26vw] w-[26vw] rounded-full border border-[#f2a35e]/15" />

        <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-6 py-6 font-mono text-[10px] tracking-[0.28em] text-white/45 uppercase sm:px-10 lg:px-20">
          <Link href="/" className="transition-colors hover:text-[#f2a35e]">RH2-1 / PROJECTS</Link>
          <Link href="/" className="transition-colors hover:text-[#f2a35e]">Back to archive ↗</Link>
        </header>

        <div className="relative z-10 grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#f2a35e] uppercase">
              <span aria-hidden="true" className="block h-px w-10 bg-[#f2a35e]" />
              Security research toolkit / 01
            </p>
            <h1 className="rh2-project-title mt-7 text-[18vw] leading-[0.78] font-black tracking-[-0.04em] uppercase sm:text-[14vw] lg:text-[10rem]">
              RH2<br /><span>ENUM</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/65 sm:text-2xl">
              A focused Python framework for authentication analysis—built to compare normal and candidate responses, surface meaningful differences, and turn a vague signal into explainable evidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] tracking-[0.2em] uppercase">
              <span className="border border-[#f2a35e]/50 px-3 py-2 text-[#f2a35e]">Python 3.10+</span>
              <span className="border border-white/15 px-3 py-2 text-white/55">Requests</span>
              <span className="border border-white/15 px-3 py-2 text-white/55">Rich CLI</span>
              <span className="border border-white/15 px-3 py-2 text-white/55">v1.0.0</span>
            </div>
          </div>

          <div className="rh2-project-specimen relative mx-auto w-full max-w-xl overflow-hidden border border-[#f2a35e]/35 bg-[#08090d] lg:mb-4">
            {/* User-provided RH2 Enum artwork, matched to the archive palette. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/projects/rh2-enum-system.png" alt="Abstract amber and black RH2 Enum response-analysis system diagram" className="h-full min-h-72 w-full object-cover opacity-85" />
            <div aria-hidden="true" className="rh2-project-scan absolute inset-0" />
            <div className="absolute inset-x-5 top-5 flex justify-between font-mono text-[9px] tracking-[0.25em] text-[#f2a35e] uppercase">
              <span>RH2 / ENUM</span>
              <span>SYS-0001</span>
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
              <span className="font-mono text-[10px] tracking-[0.25em] text-white/60 uppercase">Response difference engine</span>
              <span className="rh2-project-live h-2 w-2 rounded-full bg-[#f2a35e]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[#f2a35e] uppercase">The idea</p>
            <h2 className="mt-5 max-w-md text-4xl leading-[0.95] font-black tracking-tight uppercase sm:text-6xl">Find the difference that matters.</h2>
          </div>
          <div className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            <p>Authentication behavior rarely announces itself with one perfect response. A target may reveal a subtle status change, a different message length, a timing delta, or one inserted character. RH2 Enum turns those small differences into a repeatable comparison workflow.</p>
            <p className="mt-6">The tool learns a baseline, injects one candidate at a time into a controlled request template, compares the result, and reports the evidence behind the difference. That emphasis on explanation is the point: the output should help a researcher decide what to verify next.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#07080c] px-6 py-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] tracking-[0.35em] text-[#f2a35e] uppercase">Under the hood</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight uppercase sm:text-6xl">Six working parts.</h2>
            </div>
            <p className="max-w-sm font-mono text-[10px] leading-relaxed tracking-[0.2em] text-white/35 uppercase">Parse → baseline → compare → explain → verify</p>
          </div>
          <ol className="mt-16 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(([number, title, description]) => (
              <li key={number} className="rh2-module-card bg-[#07080c] p-6 transition-colors hover:bg-[#0d0e13] sm:p-8">
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#f2a35e]">{number}</span>
                <h3 className="mt-12 text-2xl font-bold tracking-tight text-[#f7ede1]">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/50">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[#f2a35e] uppercase">Workflow</p>
            <h2 className="mt-5 text-4xl leading-none font-black tracking-tight uppercase sm:text-6xl">Evidence over noise.</h2>
          </div>
          <div className="space-y-8">
            {[
              ["01", "Load a controlled request", "Keep the method, headers, body, and placeholder explicit so the test can be reproduced."],
              ["02", "Learn normal behavior", "Collect baseline responses and calculate the target's normal fingerprint and timing range."],
              ["03", "Compare candidates", "Run bounded candidate checks and inspect status, length, similarity, precise differences, and timing."],
              ["04", "Read the reason", "A candidate is useful only when the output explains why it differed and what should be verified next."],
            ].map(([number, title, text]) => (
              <div key={number} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-white/10 pt-5">
                <span className="font-mono text-xs text-[#f2a35e]">{number}</span>
                <div><h3 className="text-lg font-semibold text-[#f7ede1]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black px-6 py-20 sm:px-10 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[#f2a35e] uppercase">Open source project</p>
            <h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">Read the implementation.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">The public repository contains the modular Python source, CLI components, analyzers, comparison layers, and project metadata.</p>
          </div>
          <a href="https://github.com/RH2-1/RH2-Enum" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-4 border border-[#f2a35e]/60 px-7 py-4 font-mono text-xs tracking-[0.25em] text-[#f2a35e] uppercase transition hover:bg-[#f2a35e]/10 hover:text-white">Open GitHub ↗</a>
        </div>
      </section>
    </main>
  );
}
