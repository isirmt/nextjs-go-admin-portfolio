"use client";

import {
  BookOpenTextIcon,
  FolderKanbanIcon,
  HouseIcon,
  ImagesIcon,
  ListTreeIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHamburgerContext } from "@/contexts/hamburgerContext";
import { Button } from "@/components/shadcn/ui/button";
import SessionButton from "./sessionButton";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  nested?: boolean;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "コンテンツ",
    items: [
      {
        href: "/console/works",
        label: "制作物",
        icon: FolderKanbanIcon,
      },
    ],
  },
  {
    label: "ブログ",
    items: [
      {
        href: "/console/blogs",
        label: "記事",
        icon: BookOpenTextIcon,
      },
      {
        href: "/console/series",
        label: "シリーズ",
        icon: ListTreeIcon,
        nested: true,
      },
    ],
  },
  {
    label: "メディア",
    items: [
      {
        href: "/console/images",
        label: "画像",
        icon: ImagesIcon,
      },
    ],
  },
];

export default function ConsoleSidebar() {
  const { isOpen, isCollapsed, setIsCollapsed, setIsOpen } =
    useHamburgerContext();
  const pathname = usePathname();
  const collapsibleLabelClass = `min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${isCollapsed ? "max-w-48 opacity-100 lg:max-w-0 lg:-translate-x-2 lg:opacity-0" : "max-w-48 opacity-100"}`;

  const closeMobileSidebar = () => setIsOpen(false);

  return (
    <aside
      className={`bg-muted/50 border-border/50 fixed top-12 left-0 z-50 flex h-[calc(100dvh-3rem)] w-72 flex-col border-r px-3 py-4 transition-[transform,width] duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-16" : "lg:w-72"}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="mb-4 hidden rounded-lg lg:inline-flex"
        title={isCollapsed ? "サイドバーを展開する" : "サイドバーを畳む"}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <PanelLeftOpenIcon className="shrink-0" />
        ) : (
          <PanelLeftCloseIcon className="shrink-0" />
        )}
      </Button>
      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start overflow-hidden rounded-lg transition-[margin,padding,gap] ${!isCollapsed && item.nested ? "lg:ml-4 lg:w-[calc(100%-1rem)]" : ""} ${isCollapsed ? "lg:w-full lg:gap-0 lg:px-3" : ""}`}
                  >
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      onClick={closeMobileSidebar}
                    >
                      <Icon className="shrink-0 transition-transform duration-200" />
                      <span className={collapsibleLabelClass}>
                        {item.label}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-4 pt-4">
        <SessionButton
          className={`w-full ${isCollapsed ? "lg:size-9 lg:self-center lg:px-0" : ""}`}
          compact={isCollapsed}
        />
        <Button
          asChild
          variant="outline"
          className={`w-full ${isCollapsed ? "lg:size-9 lg:self-center lg:px-0" : ""}`}
        >
          <Link
            href="/"
            title={isCollapsed ? "トップへ戻る" : undefined}
            onClick={closeMobileSidebar}
          >
            <HouseIcon />
            <span className={collapsibleLabelClass}>トップへ戻る</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}
