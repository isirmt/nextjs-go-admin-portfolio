import ConsoleMenuButton from "./menuButton";

export default function ConsoleHeader() {
  return (
    <header className="sticky top-0 left-0 z-60 flex h-12 w-full items-center justify-between bg-[#c6f4ff] px-4 text-[#054a5c] select-none lg:justify-center">
      <div className="flex w-1/3 items-center justify-start lg:hidden">
        <ConsoleMenuButton />
      </div>
      <div className="font-dot flex w-1/3 items-center justify-center gap-1 text-lg md:gap-2 md:text-2xl">
        <span className="hidden sm:block">ISIRMT.COM</span>
        <span className="bg-[#054a5c] px-2 text-base text-[#c6f4ff] md:text-xl">
          CONSOLE
        </span>
      </div>
      <div className="w-1/3 lg:hidden" />
    </header>
  );
}
