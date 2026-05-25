"use client";

import { useEffect, useRef, useState } from "react";

export default function SearchWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none fixed top-0 gap-6 left-0 z-100 flex size-full flex-col items-end bg-transparent p-6">
      <div className="relative h-12 w-78 z-10">
        <input className="font-noto pointer-events-auto block h-12 w-78 rounded-full border border-[#ccc] bg-white/60 px-4 py-1 text-[#333] shadow-md shadow-[#ccc] backdrop-blur-2xl hover:border-[#777]" />
      </div>
      {isOpen && (
        <div className={`z-0 pointer-events-auto relative p-4 h-64 w-120 bg-white/85 border rounded border-[#ccc] backdrop-blur-2xl`}>

        </div>
      )}
    </div>
  );
}
