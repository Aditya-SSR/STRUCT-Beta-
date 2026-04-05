"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useIntroStore } from "@/store/introStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  colors = ["#C8C5BE", "#1C1B1A"],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl,
  menuButtonColor = "#FAF9F6",
  openMenuButtonColor = "#FAF9F6",
  changeMenuColorOnOpen = true,
  accentColor = "#FF5A00",
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const showMenu = useIntroStore((s) => s.showMenu);

  const panelRef        = useRef<HTMLDivElement | null>(null);
  const preLayersRef    = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef  = useRef<HTMLElement[]>([]);

  const plusHRef        = useRef<HTMLSpanElement | null>(null);
  const plusVRef        = useRef<HTMLSpanElement | null>(null);
  const iconRef         = useRef<HTMLSpanElement | null>(null);
  const textInnerRef    = useRef<HTMLSpanElement | null>(null);
  const textWrapRef     = useRef<HTMLSpanElement | null>(null);
  const toggleBtnRef    = useRef<HTMLButtonElement | null>(null);

  const [textLines, setTextLines] = useState<string[]>(["Menu", "Close"]);

  const openTlRef           = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef       = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef        = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef    = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef       = useRef<gsap.core.Tween | null>(null);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef             = useRef(false);

  // ── Layout effect: set initial positions ──────────────────────────────────

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel      = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH      = plusHRef.current;
      const plusV      = plusVRef.current;
      const icon       = iconRef.current;
      const textInner  = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(
          preContainer.querySelectorAll(".sm-prelayer")
        ) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon,  { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });

      if (toggleBtnRef.current) {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  // ── Open timeline ─────────────────────────────────────────────────────────

  const buildOpenTimeline = useCallback(() => {
    const panel  = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const itemEls    = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
    const numberEls  = Array.from(panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")) as HTMLElement[];
    const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")) as HTMLElement[];

    const layerStates = layers.map((el) => ({
      el,
      start: Number(gsap.getProperty(el, "xPercent")),
    }));
    const panelStart = Number(gsap.getProperty(panel, "xPercent"));

    if (itemEls.length)   gsap.set(itemEls,   { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { ["--sm-num-opacity" as any]: 0 });
    if (socialTitle)      gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07
      );
    });

    const lastTime       = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration  = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: { each: 0.1, from: "start" } },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: "power2.out", ["--sm-num-opacity" as any]: 1, stagger: { each: 0.08, from: "start" } },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0, opacity: 1, duration: 0.55, ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            onComplete: () => { gsap.set(socialLinks, { clearProps: "opacity" }); },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  // ── Close ─────────────────────────────────────────────────────────────────

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => { busyRef.current = false; });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel  = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    closeTweenRef.current?.kill();
    const offscreen = position === "left" ? -100 : 100;

    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls     = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
        const numberEls   = Array.from(panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")) as HTMLElement[];
        const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
        const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")) as HTMLElement[];

        if (itemEls.length)     gsap.set(itemEls,     { yPercent: 140, rotate: 10 });
        if (numberEls.length)   gsap.set(numberEls,   { ["--sm-num-opacity" as any]: 0 });
        if (socialTitle)        gsap.set(socialTitle,  { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks,  { y: 25, opacity: 0 });

        busyRef.current = false;
      },
    });
  }, [position]);

  // ── Icon, color, text animations ─────────────────────────────────────────

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h    = plusHRef.current;
    const v    = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      spinTweenRef.current = gsap.timeline({ defaults: { ease: "power4.out" } })
        .to(h, { rotate: 45,  duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: "power3.inOut" } })
        .to(h, { rotate: 0,  duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        colorTweenRef.current = gsap.to(btn, {
          color: opening ? openMenuButtonColor : menuButtonColor,
          delay: 0.18, duration: 0.3, ease: "power2.out",
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? "Menu" : "Close";
    const targetLabel  = opening ? "Close" : "Menu";
    const cycles = 3;

    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === "Menu" ? "Close" : "Menu";
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const finalShift = ((seq.length - 1) / seq.length) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + seq.length * 0.07,
      ease: "power4.out",
    });
  }, []);

  // ── Toggle ────────────────────────────────────────────────────────────────

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) { onMenuOpen?.(); playOpen();  }
    else        { onMenuClose?.(); playClose(); }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    playClose();
    animateIcon(false);
    animateColor(false);
    animateText(false);
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  // ── Click away ────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        toggleBtnRef.current && !toggleBtnRef.current.contains(e.target as Node)
      ) closeMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeOnClickAway, open, closeMenu]);

  // ── Color sync on prop change ─────────────────────────────────────────────

  React.useEffect(() => {
    if (!toggleBtnRef.current) return;
    gsap.set(toggleBtnRef.current, {
      color: changeMenuColorOnOpen && openRef.current ? openMenuButtonColor : menuButtonColor,
    });
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  // ── Prelayer colors (strip middle for visual rhythm) ─────────────────────

  const prelayerColors = (() => {
    const raw = colors.length ? colors.slice(0, 4) : ["#1C1B1A", "#2A2927"];
    const arr = [...raw];
    if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1);
    return arr;
  })();

  // ─────────────────────────────────────────────────────────────────────────
  return (
 <div
  className={`sm-scope z-40 transition-opacity duration-500 ${
    showMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  } ${
    isFixed
      ? "fixed top-0 left-0 w-screen h-screen overflow-hidden"
      : "relative w-full h-full"
  }`}
>
      <div
        className={`${className ?? ""} staggered-menu-wrapper pointer-events-none relative w-full h-full z-40`}
        style={{ ["--sm-accent" as any]: accentColor }}
        data-position={position}
        data-open={open || undefined}
      >
        {/* Prelayers */}
        <div
          ref={preLayersRef}
          className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-5"
          aria-hidden="true"
        >
          {prelayerColors.map((c, i) => (
            <div
              key={i}
              className="sm-prelayer absolute top-0 right-0 h-full w-full"
              style={{ background: c }}
            />
          ))}
        </div>

        {/* Header */}
        <header
          className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between p-[2em] bg-transparent pointer-events-none z-20"
          aria-label="Main navigation header"
        >
          {/* Logo */}
          <div className="sm-logo flex items-center select-none pointer-events-auto">
            {logoUrl ? (
              <Link href="/" aria-label="Go to homepage">
                <img
                  src={logoUrl}
                  alt="Struct"
                  className="sm-logo-img block h-8 w-auto object-contain"
                  draggable={false}
                  width={110}
                  height={24}
                />
              </Link>
            ) : null}
          </div>

          {/* Toggle button */}
          <button
            ref={toggleBtnRef}
            className="sm-toggle relative inline-flex items-center gap-[0.3rem] bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible pointer-events-auto"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              ref={textWrapRef}
              className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
              aria-hidden="true"
            >
              <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col leading-none">
                {textLines.map((l, i) => (
                  <span className="sm-toggle-line block h-[1em] leading-none" key={i}>
                    {l}
                  </span>
                ))}
              </span>
            </span>

            <span
              ref={iconRef}
              className="sm-icon relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <span ref={plusHRef} className="sm-icon-line absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-xs -translate-x-1/2 -translate-y-1/2" />
              <span ref={plusVRef} className="sm-icon-line absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-xs -translate-x-1/2 -translate-y-1/2" />
            </span>
          </button>
        </header>

        {/* Panel */}
        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel absolute top-0 right-0 h-full bg-white flex flex-col overflow-y-auto z-10 pointer-events-auto"
          style={{ padding: "6em 2em 2em 2em" }}
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            {/* Nav items — Next.js Link */}
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items.length ? (
                items.map((it, idx) => (
                  <li key={it.label + idx} className="sm-panel-itemWrap relative overflow-hidden leading-none">
                    <Link
                      href={it.link}
                      aria-label={it.ariaLabel}
                      onClick={closeMenu}
                      className="sm-panel-item relative text-black font-semibold cursor-pointer leading-none uppercase no-underline pr-[1.4em] inline-block"
                      data-index={idx + 1}
                    >
                      <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
                        {it.label}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none">
                  <span className="sm-panel-item relative text-black font-semibold cursor-pointer leading-none uppercase inline-block pr-[1.4em]">
                    <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {/* Socials */}
            {displaySocials && socialItems.length > 0 && (
              <div className="sm-socials mt-auto pt-8 flex flex-col gap-3" aria-label="Social links">
                <h3 className="sm-socials-title m-0 text-base font-medium" style={{ color: "var(--sm-accent)" }}>
                  Socials
                </h3>
                <ul className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap" role="list">
                  {socialItems.map((s, i) => (
                    <li key={s.label + i} className="sm-socials-item">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link text-[1.2rem] font-medium text-[#111] no-underline inline-block py-0.5"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Styles ── */}
      <style>{`
        .sm-scope .staggered-menu-panel { width: clamp(260px, 38vw, 420px); }
        .sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
        .sm-scope .sm-prelayers { width: clamp(260px, 38vw, 420px); }
        .sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
        .sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; }
        .sm-scope .sm-panel-item { font-size: 4rem; letter-spacing: -2px; color: #000; transition: color 0.15s ease; }
        .sm-scope .sm-panel-item:hover { color: var(--sm-accent, #FF5A00); }
        .sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
        .sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
          counter-increment: smItem;
          content: counter(smItem, decimal-leading-zero);
          position: absolute; top: 0.1em; right: 3.2em;
          font-size: 18px; font-weight: 400;
          color: var(--sm-accent, #FF5A00);
          letter-spacing: 0; pointer-events: none;
          opacity: var(--sm-num-opacity, 0);
        }
        .sm-scope .sm-socials-list .sm-socials-link { transition: color 0.3s ease, opacity 0.3s ease; }
        .sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
        .sm-scope .sm-socials-link:hover { color: var(--sm-accent, #FF5A00); }
        .sm-scope .sm-icon-line { will-change: transform; }
        .sm-scope .sm-toggle { font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: 0.1em; }
        @media (max-width: 1024px) {
          .sm-scope .staggered-menu-panel,
          .sm-scope .sm-prelayers { width: 100%; left: 0; right: 0; }
        }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;