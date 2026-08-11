"use client";

import { useEffect } from "react";

const SCROLLBAR_WIDTH_VAR = "--scrollbar-width";

const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth;
};

export default function ScrollbarWidthSetter() {
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const update = () => {
      rootStyle.setProperty(SCROLLBAR_WIDTH_VAR, `${getScrollbarWidth()}px`);
    };

    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      rootStyle.removeProperty(SCROLLBAR_WIDTH_VAR);
    };
  }, []);

  return null;
}
