"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePageReady } from "@/context/PageReadyContext";

type ExitPhase = "curtain-drop" | "curtain-rise" | null;

export default function NavigationLoader() {
  const { isReady } = usePageReady();
  const [exitPhase, setExitPhase] = useState<ExitPhase>(null);

  const fillRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef(0);
  const startRef = useRef(0);
  const doneRef = useRef(false);

  // ── Check sessionStorage synchronously at render time (no useEffect delay) ──
  // This runs on every render so it picks up intro-shown after IntroLoader sets it.
  const introShown =
    typeof window !== "undefined" && !!sessionStorage.getItem("intro-shown");

  // The loader is visible when the page is not ready OR while the exit animation plays.
  // By computing this directly in the render (not in useEffect), the dark overlay
  // appears in the SAME render cycle as isReady→false, blocking any skeleton flash.
  const loaderVisible = introShown && (!isReady || exitPhase !== null);

  // ── Reset counters when a new navigation begins ──
  useEffect(() => {
    if (!isReady && introShown) {
      pctRef.current = 0;
      doneRef.current = false;
      startRef.current = Date.now();
      if (fillRef.current) fillRef.current.style.width = "0%";
      if (numRef.current) numRef.current.textContent = "0%";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // ── Progress bar tick while loading ──
  useEffect(() => {
    if (isReady || !introShown) return;

    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      if (doneRef.current) return;
      const step =
        pctRef.current < 50
          ? Math.random() * 9 + 4
          : pctRef.current < 80
            ? Math.random() * 5 + 2
            : Math.random() * 2 + 0.5;
      pctRef.current = Math.min(pctRef.current + step, 99);
      if (fillRef.current) fillRef.current.style.width = pctRef.current + "%";
      if (numRef.current) numRef.current.textContent = Math.floor(pctRef.current) + "%";
      timeout = setTimeout(tick, Math.random() * 130 + 50);
    }

    tick();
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // ── When page signals ready, play exit animation ──
  useEffect(() => {
    if (!isReady || doneRef.current || !introShown || exitPhase !== null) return;

    const elapsed = Date.now() - startRef.current;
    const minWait = 600;

    const finish = () => {
      doneRef.current = true;
      if (fillRef.current) fillRef.current.style.width = "100%";
      if (numRef.current) numRef.current.textContent = "100%";

      setTimeout(() => {
        setExitPhase("curtain-drop");
        setTimeout(() => {
          setExitPhase("curtain-rise");
          setTimeout(() => setExitPhase(null), 650);
        }, 700);
      }, 200);
    };

    if (elapsed >= minWait) {
      finish();
    } else {
      const t = setTimeout(finish, minWait - elapsed);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // ── Hard fallback: force-complete after 4s ──
  useEffect(() => {
    if (isReady || !introShown) return;

    const fallback = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        setExitPhase("curtain-drop");
        setTimeout(() => {
          setExitPhase("curtain-rise");
          setTimeout(() => setExitPhase(null), 650);
        }, 700);
      }
    }, 4000);

    return () => clearTimeout(fallback);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  if (!loaderVisible) return null;

  return (
    <>
      {/* Cream curtain — drops to cover dark bg, then rises to reveal the page */}
      <div
        className={`fixed inset-0 z-[10000] bg-cream pointer-events-none ${
          exitPhase === "curtain-drop"
            ? "animate-curtainDrop"
            : exitPhase === "curtain-rise"
              ? "animate-curtainRise"
              : "translate-y-full"
        }`}
      />

      {/* Dark loader screen */}
      {(!isReady || exitPhase === "curtain-drop") && (
        <div className="fixed inset-0 z-[9999] bg-ink flex items-center justify-center overflow-hidden">
          {/* Grain overlay */}
          <div
            className="absolute inset-[-50%] w-[200%] h-[200%] pointer-events-none opacity-50 animate-grain"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Corner decorations */}
          <Corner position="top-8 left-8" />
          <Corner position="top-8 right-8" flip="x" />
          <Corner position="bottom-8 left-8" flip="y" />
          <Corner position="bottom-8 right-8" flip="xy" />

          {/* Stage */}
          <div className="relative z-[2] flex flex-col items-center text-center">
            {/* Eyebrow */}
            <div className="font-mono text-[.58rem] tracking-[.35em] uppercase text-text-muted flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-text-muted" />
              Portfolio
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-text-muted" />
            </div>

            {/* Avatar with spinning rings */}
            <div className="relative w-[90px] h-[90px] mb-7">
              <div className="absolute inset-[-8px] rounded-full border border-transparent border-t-accent-orange border-r-[rgba(212,98,42,.25)] animate-spin" />
              <div className="absolute inset-[-3px] rounded-full border border-dashed border-[rgba(139,115,85,.2)] animate-[spin_4s_linear_infinite_reverse]" />
              <div className="w-[90px] h-[90px] rounded-full overflow-hidden border-2 border-[rgba(240,236,227,.15)] bg-gradient-to-br from-[#3a3028] to-ink shadow-[0_0_0_6px_rgba(42,33,24,.6),0_16px_40px_rgba(0,0,0,.4)] relative z-[1]">
                <Image
                  src="/assets/home/profile-img.jpg"
                  alt="Avishek Devnath"
                  width={90}
                  height={90}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Name */}
            <div className="overflow-hidden mb-1">
              <span className="font-heading text-[clamp(3.5rem,10vw,8rem)] font-extralight leading-[.95] text-cream tracking-[-0.02em] block">
                Avishek
              </span>
            </div>
            <div className="overflow-hidden">
              <span
                className="font-heading text-[clamp(3.5rem,10vw,8rem)] font-extralight leading-[.95] italic text-transparent tracking-[-0.02em] block"
                style={{ WebkitTextStroke: "1px rgba(240,236,227,.35)" }}
              >
                Devnath
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-10 w-[clamp(160px,30vw,260px)]">
              <div className="relative h-px bg-[rgba(255,255,255,.08)]">
                <div
                  ref={fillRef}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-warm-brown to-accent-orange transition-[width] duration-[60ms] linear"
                  style={{ width: "0%" }}
                >
                  <span className="absolute right-[-1px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-accent-orange shadow-[0_0_8px_2px_rgba(212,98,42,.6)]" />
                </div>
              </div>
              <span
                ref={numRef}
                className="block font-mono text-[.58rem] text-text-muted text-right mt-2 tracking-[.08em]"
              >
                0%
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div className="absolute bottom-10 font-heading text-[clamp(.75rem,1.5vw,1rem)] italic font-light text-[rgba(139,115,85,.5)] tracking-[.05em]">
            &ldquo;Building systems that last.&rdquo;
          </div>
        </div>
      )}
    </>
  );
}

function Corner({ position, flip }: { position: string; flip?: "x" | "y" | "xy" }) {
  const scale =
    flip === "x" ? "scale-x-[-1]" : flip === "y" ? "scale-y-[-1]" : flip === "xy" ? "scale-[-1]" : "";
  return (
    <div className={`absolute w-10 h-10 ${position} ${scale}`}>
      <div className="absolute left-0 top-0 w-px h-full bg-[rgba(139,115,85,.3)]" />
      <div className="absolute left-0 top-0 w-full h-px bg-[rgba(139,115,85,.3)]" />
    </div>
  );
}
