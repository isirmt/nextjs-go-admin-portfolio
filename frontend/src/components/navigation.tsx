import Link from "next/link";

const links = [
  { href: "/", label: "Profile", subLabel: "プロフィール" },
  { href: "/console/works", label: "Console", subLabel: "コンソール" },
];

export default function Navigation() {
  return (
    <nav className="pointer-events-none relative top-0 z-50 -mt-24 h-24 w-full border-t-2 border-dotted border-[#888]">
      <div className="absolute top-0 left-0 size-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,1)_50%,rgba(255,255,255,1))]" />
      <ul className="font-dot flex h-full w-full items-center justify-start gap-6 px-10 tracking-wide">
        {links.map(({ href, label, subLabel }) => (
          <li key={href}>
            <Link
              href={href}
              className="pointer-events-auto inline-flex flex-col items-center justify-center drop-shadow-xl drop-shadow-[#aaa]/80 transition-all duration-200 hover:scale-105"
            >
              <div className="text-2xl leading-none">{label}</div>
              <div className="text-sm leading-none">{subLabel}</div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
