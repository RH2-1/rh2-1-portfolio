"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The React <-> three.js boundary, and nothing else.
 *
 * This component owns exactly one concern: the WebGL canvas's lifetime. It
 * mounts the scene into a div when the element is on screen, and tears it down
 * (freeing the GL context) when it unmounts.
 *
 * Why the intersection check: `<Canvas>`-style code must never run during
 * prerender, and it should not run at all if the reader never scrolls to it.
 * The scene only initialises once the container is actually visible.
 *
 * WebGL availability is checked before mounting so a browser without it gets
 * the page's normal content instead of a console full of errors.
 */
export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");
  const [assets, setAssets] = useState<{ loaded: number; failed: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let handle: { dispose(): void } | null = null;
    let cancelled = false;

    // Probe for WebGL before doing any work. This lives inside the observer
    // callback rather than the effect body so no state is set synchronously
    // during the effect — the container is fixed and full-bleed, so the
    // callback runs on the next frame either way.
    function supportsWebGL(): boolean {
      try {
        const probe = document.createElement("canvas");
        return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
      } catch {
        return false;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (cancelled || handle) return;
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();

        // A browser without WebGL gets the narrative text, unmodified.
        if (!supportsWebGL()) {
          setStatus("failed");
          return;
        }

        // Imported lazily so the three.js bundle is not part of the initial
        // page payload; it is fetched only when the scene is needed.
        void import("@/lib/scene").then(({ mountScene }) => {
          if (cancelled) return;
          try {
            handle = mountScene(container, {
              onReady: () => setStatus("ready"),
              onAssetsLoaded: (loaded, failed) => setAssets({ loaded, failed }),
            });
          } catch (error) {
            console.error("[scene] failed to initialise", error);
            setStatus("failed");
          }
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      handle?.dispose();
      handle = null;
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      data-scene-status={status}
      data-scene-assets={assets ? `${assets.loaded}/${assets.loaded + assets.failed}` : ""}
      ref={containerRef}
    >
      {status !== "failed" ? (
        <div
          className={`absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#16233f_0%,#070b14_60%,#03050a_100%)] transition-opacity duration-[1200ms] ease-out ${
            status === "ready" ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : null}
    </div>
  );
}
