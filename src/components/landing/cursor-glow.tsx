"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    const handlePointerMove = (event: PointerEvent) => {
      const glow = glowRef.current;
      if (!glow) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow.style.setProperty("--cursor-x", `${event.clientX}px`);
        glow.style.setProperty("--cursor-y", `${event.clientY}px`);
        glow.classList.add("is-visible");
      });
    };
    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) glowRef.current?.classList.remove("is-visible");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerout", handlePointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerLeave);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
