"use client";

export default function SearchWindow() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 z-100 flex size-full flex-col items-end bg-transparent p-6">
      <div className="relative h-12 w-78">
        <input className="font-noto pointer-events-auto block h-12 w-78 rounded-full border border-[#ccc] bg-white/60 px-4 py-1 text-[#333] shadow-md shadow-[#ccc] backdrop-blur-2xl hover:border-[#777]" />
      </div>
    </div>
  );
}
