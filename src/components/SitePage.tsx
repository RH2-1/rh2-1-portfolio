"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Hero from "@/components/Hero";
import Exhibit from "@/components/Exhibit";
import AboutMe from "@/components/AboutMe";
import Archive from "@/components/Archive";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";

const SECTIONS = new Set(["home", "about", "gallery", "writeups", "contact"]);

export default function SitePage() {
  const pathname = usePathname();

  useEffect(() => {
    const section = pathname.replace(/^\//, "");
    if (!SECTIONS.has(section) || section === "home") {
      if (section === "home") {
        const homeTimeout = window.setTimeout(
          () => window.scrollTo({ top: 0, behavior: "smooth" }),
          80,
        );
        return () => window.clearTimeout(homeTimeout);
      }
      return;
    }

    const targetId = section === "contact" ? "contact-email" : section;
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    };

    const firstPass = window.setTimeout(scrollToTarget, 120);
    const layoutPass = window.setTimeout(scrollToTarget, 700);
    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(layoutPass);
    };
  }, [pathname]);

  return (
    <main className="relative">
      <Hero />
      <Exhibit />
      <AboutMe />
      <Archive />
      <Footer />
      <Cursor />
    </main>
  );
}
