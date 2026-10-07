import { CHAPTERS } from "@/lib/narrative";

/**
 * The readable half of the site.
 *
 * It is a plain server component and stays that way on purpose: the text is
 * static, so it needs no JavaScript, no client boundary, and it is what a
 * crawler or a reader with WebGL disabled actually sees.
 *
 * Layout contract with the 3D scene — keep these in step if you change either:
 *  - every chapter is exactly one viewport tall (`h-screen`), which is what
 *    makes "scroll progress" map linearly onto "chapter index" in scene.ts;
 *  - the copy alternates sides so the subject is never covered;
 *  - the first chapter's spacing is padded so the hero has an unobstructed beat.
 */
export default function Narrative() {
  return (
    <div className="relative z-10">
      {CHAPTERS.slice(1).map((chapter, index) => {
        const alignRight = index % 2 === 1;
        // The hero section consumed chapter 0; chapters below start at beat 1.
        const beatIndex = index + 1;

        return (
          <section
            key={chapter.id}
            id={chapter.id}
            aria-labelledby={`${chapter.id}-title`}
            data-beat={beatIndex}
            className="flex h-screen items-center px-6 sm:px-10 lg:px-20"
          >
            <article
              className={`max-w-xl rounded-3xl p-7 backdrop-blur-[3px] sm:p-9 ${
                alignRight
                  ? "ml-auto bg-gradient-to-bl from-black/60 via-black/30 to-transparent text-right"
                  : "mr-auto bg-gradient-to-br from-black/60 via-black/30 to-transparent"
              }`}
            >
              <p
                className={`mb-4 font-mono text-xs tracking-[0.3em] text-white/45 uppercase ${
                  alignRight ? "text-right" : ""
                }`}
              >
                {chapter.eyebrow}
              </p>

              <h2
                id={`${chapter.id}-title`}
                className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl"
              >
                {chapter.title}
              </h2>

              <div
                className={`mt-6 h-px w-16 bg-gradient-to-r from-white/60 to-transparent ${
                  alignRight ? "ml-auto bg-gradient-to-l" : ""
                }`}
              />

              <p className="mt-6 text-base leading-relaxed text-pretty text-white/65 sm:text-lg">
                {chapter.body}
              </p>
            </article>
          </section>
        );
      })}
    </div>
  );
}
