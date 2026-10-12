"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { getHeadingId } from "@/lib/blogs/headings";

type HeadingLevel = 1 | 2 | 3;

type TableOfContentsContextValue = {
  activeId: string;
};

const TableOfContentsContext =
  createContext<TableOfContentsContextValue | null>(null);

type TableOfContentsItemProps = {
  id: string;
  level: HeadingLevel;
  children: ReactNode;
  activeId: string;
};

function TableOfContentsItem({
  id,
  level,
  children,
  activeId,
}: TableOfContentsItemProps) {
  const isH3 = level === 3;
  const isActive = activeId === id;

  return (
    <li className="group font-noto relative w-full list-none leading-[1.75] before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-3.5 before:w-px before:bg-[#b2b7c7] first:before:top-1/2 last:before:bottom-1/2">
      <span
        aria-hidden
        className={`${isH3 ? "left-2.5 size-2" : "left-2 size-3"} pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 rounded-full border transition-all duration-200 group-hover:border-[#708dec] group-hover:bg-[#708dec] ${
          isActive
            ? "border-[#5f7bd6]! bg-[#5f7bd6]!"
            : "border-[#b2b7c7] bg-[#b2b7c7]"
        }`}
      />
      <a
        aria-current={isActive ? "location" : undefined}
        className={`${isH3 ? "pl-10" : "pl-8"} inline-block w-full rounded-md p-0.5 transition-colors ${
          isActive ? "font-semibold text-[#234dd8]" : "text-[#333]"
        }`}
        href={id ? `#${id}` : "#"}
      >
        {children}
      </a>
    </li>
  );
}

function MarkdownHeadingLink({
  children,
  level,
}: {
  children: ReactNode;
  level: Extract<HeadingLevel, 2 | 3>;
}) {
  const context = useContext(TableOfContentsContext);
  if (!context) return null;

  return (
    <TableOfContentsItem
      activeId={context.activeId}
      id={getHeadingId(children)}
      level={level}
    >
      {children}
    </TableOfContentsItem>
  );
}

const markdownComponents: Components = {
  h2: ({ children }) => (
    <MarkdownHeadingLink level={2}>{children}</MarkdownHeadingLink>
  ),
  h3: ({ children }) => (
    <MarkdownHeadingLink level={3}>{children}</MarkdownHeadingLink>
  ),
};

type BlogTableOfContentsProps = {
  content: string;
  title: string;
};

export default function BlogTableOfContents({
  content,
  title,
}: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>("[data-blog-heading-id]"),
    );
    if (headings.length === 0) {
      const animationFrame = requestAnimationFrame(() => setActiveId(""));
      return () => cancelAnimationFrame(animationFrame);
    }

    const updateActiveHeading = () => {
      const offset = 200;
      let currentId = "";

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= 0) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        currentId = headings.at(-1)?.id ?? "";
      }

      setActiveId((previousId) =>
        previousId === currentId ? previousId : currentId,
      );
    };

    let animationFrame: number | null = null;
    const scheduleActiveHeadingUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = null;
        updateActiveHeading();
      });
    };

    updateActiveHeading();
    window.addEventListener("scroll", scheduleActiveHeadingUpdate, {
      passive: true,
    });
    window.addEventListener("resize", scheduleActiveHeadingUpdate);
    window.addEventListener("hashchange", scheduleActiveHeadingUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleActiveHeadingUpdate);
      window.removeEventListener("resize", scheduleActiveHeadingUpdate);
      window.removeEventListener("hashchange", scheduleActiveHeadingUpdate);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    };
  }, [content]);

  return (
    <nav className="flex flex-col px-3 pt-6 pb-3">
      <TableOfContentsContext.Provider value={{ activeId }}>
        <ol className="max-h-dvh w-full overflow-y-auto pt-2 pl-2">
          <TableOfContentsItem activeId={activeId} id="" level={1}>
            {title}
          </TableOfContentsItem>
          <ReactMarkdown
            allowedElements={["h2", "h3"]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </ol>
      </TableOfContentsContext.Provider>
    </nav>
  );
}
