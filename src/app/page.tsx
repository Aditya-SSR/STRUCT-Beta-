"use client";

import { useEffect } from "react";
import StructIntro from "@/components/structIntro";
import { data } from "@/components/data";
import { useIntroStore } from "@/store/introStore";

export default function Home() {
  const setShowMenu = useIntroStore((s) => s.setShowMenu);

  // 🔥 Hide menu when entering home page
  useEffect(() => {
    setShowMenu(false);
  }, [setShowMenu]);

  return (
    <StructIntro
      items={data}
      onMenuReveal={() => setShowMenu(true)}
    />
  );
}