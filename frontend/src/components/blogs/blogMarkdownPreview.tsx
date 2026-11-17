/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";
import { getHeadingId } from "@/lib/blogs/headings";

type BlogMarkdownPreviewProps = {
  content: string;
  adminImageAccess?: boolean;
};

const shikiTheme = "catppuccin-latte";

function BlogCodeBlock({
  code,
  language,
  fileName,
}: {
  code: string;
  language: string;
  fileName?: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    setHtml(null);
    (async () => {
      const { codeToHtml } = await import("shiki");
      try {
        const highlighted = await codeToHtml(code, {
          lang: language as BundledLanguage,
          theme: shikiTheme,
        });
        if (isCurrent) setHtml(highlighted);
      } catch {
        if (isCurrent) setHtml("");
      }
    })();
    return () => {
      isCurrent = false;
    };
  }, [code, language]);

  return (
    <div className="post_codeblock">
      <div className="post_fname">
        <span>{fileName ?? "<無題>"}</span>
        <span className="h-4 border-l border-slate-200" />
        <span className="post_lang">{language}</span>
      </div>
      {html ? (
        <div
          className="post_shiki"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre>{<code>{code}</code>}</pre>
      )}
    </div>
  );
}

const components: Components = {
  h2: ({ node, children, ...props }) => {
    const id = props.id ?? getHeadingId(children);
    const isFootnoteLabel = id === "footnote-label";
    return (
      <div className="mt-3 mb-4 border-b-2 border-blue-200 px-2.5 text-blue-700 transition-colors">
        <h2
          {...props}
          className={isFootnoteLabel ? undefined : props.className}
          data-blog-heading-id={isFootnoteLabel ? undefined : id}
          id={id}
        >
          {isFootnoteLabel ? "脚注" : children}
        </h2>
      </div>
    );
  },
  h3: ({ node, children, ...props }) => {
    const id = getHeadingId(children);
    return (
      <h3 {...props} data-blog-heading-id={id} id={id}>
        {children}
      </h3>
    );
  },
  a: ({ node, href, ...props }) => {
    const isInternalLink = href?.startsWith("/") || href?.startsWith("#");
    return isInternalLink ? (
      <a className="post_hyper_url" href={href} {...props} />
    ) : (
      <a
        className="post_hyper_url"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  pre: ({ node, children }) => <>{children}</>,
  code: ({ node, className, children, ...props }) => {
    const languageAndFileName = className?.match(/language-([^\s]+)/)?.[1];
    const [language, fileName] = languageAndFileName?.split(":", 2) ?? [];
    if (!language)
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    return (
      <BlogCodeBlock
        code={String(children).replace(/\n$/, "")}
        fileName={fileName}
        language={language}
      />
    );
  },
};

export default function BlogMarkdownPreview({
  content,
  adminImageAccess = false,
}: BlogMarkdownPreviewProps) {
  if (!content.trim()) return null;

  return (
    <div className="markdown font-noto w-full min-w-0">
      <ReactMarkdown
        components={
          adminImageAccess
            ? {
                ...components,
                img: ({ node, src, alt, ...props }) => {
                  const match =
                    typeof src === "string"
                      ? src.match(/^\/api\/images\/([0-9a-f-]{36})\/raw$/i)
                      : null;
                  return (
                    <img
                      src={match ? `/image-source/${match[1]}` : src}
                      alt={alt ?? ""}
                      {...props}
                    />
                  );
                },
              }
            : components
        }
        disallowedElements={["h1"]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
