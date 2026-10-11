/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";

type BlogMarkdownPreviewProps = {
  content: string;
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
  h2: ({ node, ...props }) => (
    <div className="mt-3 mb-4 border-b-2 border-blue-200 text-blue-700 transition-colors dark:border-slate-700 dark:text-white">
      <h2 {...props} />
    </div>
  ),
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
}: BlogMarkdownPreviewProps) {
  return (
    <div className="markdown min-h-64 border border-[#c68ef0] bg-white px-4 py-3 text-[#222]">
      {content.trim() ? (
        <ReactMarkdown
          components={components}
          disallowedElements={["h1"]}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <p className="text-sm text-[#7e11d1]">本文がありません</p>
      )}
    </div>
  );
}
