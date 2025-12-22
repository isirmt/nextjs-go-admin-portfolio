"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewAnimationOptions = {
  delayMs?: number;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

export function useInViewAnimation<T extends HTMLElement>(
  options: UseInViewAnimationOptions = {},
) {
  const {
    delayMs = 0,
    rootMargin = "0px",
    threshold = 0,
    once = true,
  } = options;
  const [node, setNode] = useState<T | null>(null);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!node || (once && isActive)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            const activate = () => {
              setIsActive(true);
              if (once) {
                observer.disconnect();
              }
            };
            if (delayMs > 0) {
              timeoutRef.current = window.setTimeout(activate, delayMs);
            } else {
              activate();
            }
          } else if (!once) {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setIsActive(false);
          } else if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        });
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [node, delayMs, rootMargin, threshold, once, isActive]);

  return { ref: setNode, isActive };
}
