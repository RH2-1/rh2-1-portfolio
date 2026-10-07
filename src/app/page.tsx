import SitePage from "@/components/SitePage";

/**
 * Page composition:
 *   Hero     — the BUG-HUNTER hero panel (interactive character + spotlight
 *              reveal). Untouched.
 *   Exhibit  — cinematic scroll-driven artwork showcase on pure black (the
 *              9:16 → 16:9 scroll → expand morph).
 *   Archive  — "VULNERABILITY RESEARCH": an asymmetric field-journal grid of
 *              world cards with hover reactions, floating words and a
 *              centered CTA (replaces the old Writeups section).
 *   Footer   — the RH2-1 art-book final page: oversized wordmark, index,
 *              socials, statement, colophon.
 */
export default function Home() {
  return <SitePage />;
}
