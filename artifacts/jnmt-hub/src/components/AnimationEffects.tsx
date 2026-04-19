import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";

/* ─────────────────────────────────────────────────────────────
   AnimationEffects — 4 global animation layers:
   1. Ripple on click/tap
   2. 3D card tilt on mouse hover
   3. Cursor glow orb (desktop)
   4. Scroll reveal for .glass / .glass-panel cards
───────────────────────────────────────────────────────────── */
export default function AnimationEffects() {
  const { activePage, isDark } = useApp();
  const glowRef = useRef<HTMLDivElement>(null);
  const tiltedCard = useRef<HTMLElement | null>(null);

  /* ── 1. Ripple on click/tap ─────────────────────────────── */
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const ring = document.createElement("div");
      const size = 80;
      ring.className = "ripple-ring";
      ring.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - size / 2}px;
        top:${e.clientY - size / 2}px;
      `;
      document.body.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  /* ── 2. 3D card tilt ────────────────────────────────────── */
  useEffect(() => {
    const isMobile = window.matchMedia("(hover: none)").matches;
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el?.closest<HTMLElement>(".glass, .glass-panel");

      if (tiltedCard.current && tiltedCard.current !== card) {
        tiltedCard.current.style.transform = "";
        tiltedCard.current.style.transition = "transform 0.4s cubic-bezier(0.22,1,0.36,1)";
        tiltedCard.current = null;
      }

      if (card) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.015)`;
        card.style.transition = "transform 0.08s ease";
        tiltedCard.current = card;
      }
    };

    const onMouseLeave = () => {
      if (tiltedCard.current) {
        tiltedCard.current.style.transform = "";
        tiltedCard.current.style.transition = "transform 0.4s cubic-bezier(0.22,1,0.36,1)";
        tiltedCard.current = null;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  /* ── 3. Cursor glow ─────────────────────────────────────── */
  useEffect(() => {
    const isMobile = window.matchMedia("(hover: none)").matches;
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
        glowRef.current.style.opacity = "1";
      }
    };
    const onMouseLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  /* ── 4. Scroll reveal ───────────────────────────────────── */
  useEffect(() => {
    // Small delay so React has painted the new page's elements
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll<HTMLElement>(".glass, .glass-panel");

      cards.forEach((el) => {
        if (el.dataset.revealed) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(22px)";
        el.style.transition = "opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)";
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
              el.dataset.revealed = "1";
            }, i * 55); // stagger 55ms per card
            observer.unobserve(el);
          });
        },
        { threshold: 0.08 }
      );

      cards.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 80);

    return () => clearTimeout(timer);
  }, [activePage]);

  const glowColor = isDark
    ? "radial-gradient(circle, rgba(232,121,160,0.22) 0%, rgba(56,189,248,0.12) 40%, transparent 70%)"
    : "radial-gradient(circle, rgba(232,121,160,0.16) 0%, rgba(56,189,248,0.09) 40%, transparent 70%)";

  return (
    <>
      {/* Cursor glow orb */}
      <div
        ref={glowRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 0,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: glowColor,
          transform: "translate(-50%, -50%)",
          transition: "left 0.07s linear, top 0.07s linear, opacity 0.4s ease",
          opacity: 0,
          willChange: "left, top",
        }}
      />
    </>
  );
}
