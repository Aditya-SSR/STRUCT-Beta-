"use client";

import { useRef, useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";



if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}


type IntroItem = {
  src: string | StaticImageData | any; 
  text?: string;
  isNegative?: boolean;
};

type StructIntroProps = {
  items?: IntroItem[];
  onComplete?: () => void;
  onMenuReveal?: () => void;
};

// ── Helper ────────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Timing Variables ──────────────────────────────────────────────────────────
const HOLD       = 0.55;
const SLIDE_DUR  = 0.9;
const BREATH     = 1.1;
const EXPAND_DUR = 1.5;



export default function StructIntro({ items = [], onComplete, onMenuReveal }: StructIntroProps) {
  // 🔥 1. State for Hydration Errors
  const [isMounted, setIsMounted] = useState(false);
  const [shuffled, setShuffled] = useState<IntroItem[]>([]);
  const [landingItem, setLandingItem] = useState<IntroItem>({} as IntroItem);

  const containerRef   = useRef<HTMLDivElement>(null);
  const rectRef        = useRef<HTMLDivElement>(null);
  const imgRefs        = useRef<(HTMLDivElement | null)[]>([]);
  
  const topNavRef      = useRef<HTMLDivElement>(null);
  const bottomLogoRef  = useRef<HTMLHeadingElement>(null);
  const objTextRef     = useRef<HTMLSpanElement>(null);

  // Parse items
  const source = items.length === 3 ? items : [
    { src: null, text: "SYS // ERROR 01", isNegative: false },
    { src: null, text: "SYS // ERROR 02", isNegative: false },
    { src: null, text: "SYS // ERROR 03", isNegative: false },
  ];

  // 🔥 2. Shuffle safely on the client side only
  useEffect(() => {
    const shuffledArray = shuffle(source);
    setShuffled(shuffledArray);
    setLandingItem(shuffledArray[2] || {});
    setIsMounted(true);
  }, []); 


  useGSAP(() => {
  
    if (!isMounted) return;

    const imgs = imgRefs.current;

    gsap.set(rectRef.current, { width: "30vw", height: "58vh", x: "-50%", y: "-50%" });
    gsap.set(imgs[0], { y: "0%" });
    gsap.set(imgs[1], { y: "100%" });
    gsap.set(imgs[2], { y: "100%" });
    
    gsap.set(topNavRef.current, { y: -20, opacity: 0 });
    gsap.set(bottomLogoRef.current, { yPercent: 100 });

    const tl = gsap.timeline();

    tl.from(rectRef.current, {
      scaleY: 0,
      transformOrigin: "center bottom",
      duration: 1.0,
      ease: "expo.out",
    });

    tl.to(imgs[1], { y: "0%", duration: SLIDE_DUR, ease: "power3.inOut" }, `+=${HOLD}`);
    tl.to(imgs[2], { y: "0%", duration: SLIDE_DUR, ease: "power3.inOut" }, `+=${HOLD}`);

    tl.to(rectRef.current, {
      width: "100vw",
      height: "100vh",
      x: "-50%",
      y: "-50%",
      duration: EXPAND_DUR,
      ease: "expo.inOut",
    }, `+=${BREATH}`);

    tl.to(bottomLogoRef.current, {
      yPercent: 0,
      duration: 1.2,
      ease: "power4.out",
    }, "-=0.2"); 

    tl.to(topNavRef.current, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
    }, "+=1"); 

    tl.add(() => {
  onMenuReveal?.();
});

    tl.to(objTextRef.current, {
      duration: 1.5,
      scrambleText: {
        text: landingItem.text || "@DROP-01//obj.2",
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@//-",
        speed: 0.4,
        revealDelay: 0.3,
      },
    }, "<"); 

  }, { scope: containerRef, dependencies: [isMounted] }); 

  // 🔥 3. Server SSR Fallback
  if (!isMounted) {
    return <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#FAF9F6" }} />;
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "#FAF9F6", overflow: "hidden" }}
    >
      <div
        ref={rectRef}
        style={{ position: "absolute", top: "50%", left: "50%", overflow: "hidden", willChange: "width, height, transform" }}
      >
        {shuffled.map((item, i) => (
          <div
            key={i}
            ref={(el) => { imgRefs.current[i] = el; }}
            style={{ position: "absolute", inset: 0, willChange: "transform" }}
          >
            {item.src ? (
              <Image
                src={item.src}
                alt={`Intro visual ${i + 1}`}
                fill
                priority 
                draggable={false}
                className="object-cover pointer-events-none select-none"
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: ["#2A2927", "#1C1B1A", "#0E0D0C"][i] }} />
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-10">
        
        {/* Adjusted to only hold the text since the menu is overlayed */}
        <div ref={topNavRef} className="flex justify-start items-start w-full pointer-events-auto">
          <span 
            ref={objTextRef} 
            className={`font-bitcount text-xs md:text-sm tracking-widest ${
              landingItem.isNegative ? "text-[#1C1B1A]" : "text-white mix-blend-difference"
            }`}
          >
            &nbsp;
          </span>
        </div>

        <div className="w-full flex justify-center mb-[-4vw] overflow-hidden">
          <h1
            ref={bottomLogoRef}
            className="font-monument text-[18vw] leading-none tracking-tighter uppercase"
            style={{ 
              color: "white", 
              mixBlendMode: landingItem.isNegative ? "difference" : "overlay",
              opacity: landingItem.isNegative ? 1 : 0.9,
              willChange: "transform"
            }}
          >
            STRUCT
          </h1>
        </div>
      </div>
    </div>
  );
}