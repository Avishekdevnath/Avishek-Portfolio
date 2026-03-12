"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/swr";
import styles from "./Header.module.css";

const ExternalIcon = () => (
  <svg
    style={{ width: 9, height: 9, marginLeft: 3, verticalAlign: "middle", opacity: 0.45, flexShrink: 0 }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const navLinks = [
  { name: "Home",     href: "/" },
  { name: "About",    href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Blog",     href: "/blogs" },
  { name: "Tools",    href: "https://aitoolbox-v1.vercel.app/", external: true },
  { name: "Contact",  href: "/contact" },
];

export default function Header() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const { profileImage: fetchedImage } = useSettings();
  const profileImage = fetchedImage || "/assets/home/profile-img.jpg";
  const pathname = usePathname();
  const navRef   = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  // scroll shrink — only setState when value actually changes
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const now = window.scrollY > 20;
        if (now !== scrolledRef.current) {
          scrolledRef.current = now;
          setScrolled(now);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // close on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const isActive = useCallback((href: string) => {
    if (href.startsWith("http")) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }, [pathname]);

  return (
    <div
      ref={navRef}
      className="sticky top-0 z-[100] flex flex-col items-center"
    >
      {/* Capsule bar */}
      <header
        className={`
          ${styles.navCapsule}
          w-[92%] sm:w-[88%] md:w-[82%] lg:w-[78%] xl:w-[72%]
          ${isOpen ? "rounded-[1.4rem]" : "rounded-full"}
          border border-cream-deeper/70
          transition-[box-shadow,transform,border-radius] duration-300
          ${scrolled
            ? `${styles.navScrolled} translate-y-2`
            : `${styles.navDefault} translate-y-4 md:translate-y-5`
          }
        `}
      >
        <div
          className={`
            flex items-center justify-between gap-4
            px-4 sm:px-5
            transition-[padding-top,padding-bottom] duration-300
            ${scrolled ? "py-[0.4rem]" : "py-[0.55rem]"}
          `}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="
                w-[36px] h-[36px] rounded-full overflow-hidden shrink-0
                border-2 border-cream-dark
                group-hover:border-orange-400
                transition-colors duration-200
                bg-gradient-to-br from-cream-dark to-sand
              "
            >
              <Image
                src={profileImage}
                alt="Avishek Devnath"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span
              className="
                text-[1.05rem] font-bold tracking-tight whitespace-nowrap
                text-ink group-hover:text-orange-600
                transition-colors duration-200
              "
            >
              Avishek
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-0.5 list-none m-0 p-0">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`
                        relative flex items-center
                        px-[0.8rem] py-[0.4rem] rounded-full
                        text-[0.86rem] font-medium whitespace-nowrap
                        transition-colors duration-200
                        ${active
                          ? "text-orange-600 bg-orange-600/[0.07]"
                          : "text-deep-brown hover:text-orange-600 hover:bg-orange-600/[0.06]"
                        }
                      `}
                    >
                      {link.name}
                      {link.external && <ExternalIcon />}
                      {active && (
                        <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-orange-400" />
                      )}
                    </Link>
                  </li>
                );
              })}

              {/* Hire Me */}
              <li>
                <Link href="/hire-me" className={`${styles.hireMe} ml-1`}>
                  Hire Me
                </Link>
              </li>
            </ul>
          </nav>

          {/* Burger */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className={`${styles.burger} ${isOpen ? styles.burgerOpen : ""} flex lg:hidden`}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile dropdown — inside header for correct semantics */}
        <nav
          aria-label="Mobile navigation"
          className={`
            lg:hidden
            overflow-hidden rounded-b-[1.1rem]
            transition-[max-height,opacity] duration-300 ease-in-out
            ${isOpen
              ? "max-h-[420px] opacity-100"
              : `max-h-0 opacity-0 ${styles.mobileNavHidden}`
            }
          `}
        >
          <ul className="flex flex-col gap-0.5 p-[0.65rem] list-none m-0 border-t border-cream-deeper/50">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`
                      flex items-center justify-between
                      py-[0.6rem] px-4 rounded-xl
                      text-[0.88rem] font-medium
                      transition-colors duration-200
                      ${active
                        ? "bg-orange-600/[0.07] text-orange-600"
                        : "text-deep-brown hover:bg-orange-600/[0.06] hover:text-orange-600"
                      }
                    `}
                  >
                    <span className="flex items-center gap-1">
                      {link.name}
                      {link.external && <ExternalIcon />}
                    </span>
                    {active && (
                      <span className="w-[6px] h-[6px] rounded-full bg-orange-400 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Mobile Hire Me */}
            <li>
              <Link
                href="/hire-me"
                onClick={() => setIsOpen(false)}
                className={`${styles.mobileHire} flex items-center justify-center py-[0.6rem] px-4`}
              >
                Hire Me
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}
