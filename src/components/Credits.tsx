/**
 * Licence credits.
 *
 * Not decorative: `public/models/Fox.glb` is CC0 for the mesh but carries
 * CC-BY-4.0 on its rigging, animation, and glTF conversion, so this attribution
 * is a licence condition of shipping that file. Everything else in the project
 * is CC0, which requires nothing — the note is here for provenance.
 *
 * If you swap the hero for `RobotExpressive.glb` (also CC0 and already on
 * disk), this block can be dropped.
 */
export default function Credits() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40 px-6 py-12 backdrop-blur-sm sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-mono text-xs tracking-[0.3em] text-white/45 uppercase">
          Credits &amp; licences
        </h2>

        <dl className="mt-6 space-y-4 text-sm text-white/55">
          <div>
            <dt className="font-medium text-white/80">Hero model — Fox.glb</dt>
            <dd className="mt-1 leading-relaxed">
              Mesh by PixelMannen (CC0-1.0). Rigging &amp; animation by tomkranis
              (CC-BY-4.0). Conversion to glTF by AsoboStudio and scurest
              (CC-BY-4.0). Distributed with{" "}
              <a
                className="underline decoration-white/30 underline-offset-2 transition hover:text-white"
                href="https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Fox/LICENSE.md"
                rel="noreferrer noopener"
                target="_blank"
              >
                Khronos glTF-Sample-Assets
              </a>
              .
            </dd>
          </div>

          <div>
            <dt className="font-medium text-white/80">Everything else</dt>
            <dd className="mt-1 leading-relaxed">
              The sky, ground, procedural subject, splinters, monoliths and stage
              rings are generated in code — no asset files. Additional CC0 models
              (a rigged robot, spacecraft parts, and a textured rock) sit unused in{" "}
              <code className="font-mono text-xs text-white/70">public/models/</code>.
              Provenance and checksums for every file are recorded in{" "}
              <code className="font-mono text-xs text-white/70">ASSETS.md</code>.
            </dd>
          </div>

          <div>
            <dt className="font-medium text-white/80">Environment lighting</dt>
            <dd className="mt-1 leading-relaxed">
              Raymarched in a shader, derived from chapter palettes in{" "}
              <code className="font-mono text-xs text-white/70">src/lib/narrative.ts</code>.
              Three CC0 HDRIs from{" "}
              <a
                className="underline decoration-white/30 underline-offset-2 transition hover:text-white"
                href="https://polyhaven.com/"
                rel="noreferrer noopener"
                target="_blank"
              >
                Poly Haven
              </a>{" "}
              are bundled in{" "}
              <code className="font-mono text-xs text-white/70">public/hdr/</code> and can be
              swapped in with one line (see the comment in{" "}
              <code className="font-mono text-xs text-white/70">src/lib/scene.ts</code>).
            </dd>
          </div>
        </dl>
      </div>
    </footer>
  );
}
