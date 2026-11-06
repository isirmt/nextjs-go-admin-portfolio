"use client";

import dynamic from "next/dynamic";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Monaco, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useImagesContext } from "@/contexts/imagesContext";
import useImageCompletion from "@/hooks/blogs/useImageCompletion";
import useImagePaste from "@/hooks/blogs/useImagePaste";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export type BlogMarkdownEditorHandle = {
  getSelectionOffsets: () => { start: number; end: number };
  focusAtOffset: (offset: number) => void;
};

type BlogMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: string;
};

const BlogMarkdownEditor = forwardRef<
  BlogMarkdownEditorHandle,
  BlogMarkdownEditorProps
>(function BlogMarkdownEditor({ value, onChange, height = "36rem" }, ref) {
  const {
    images,
    isLoading: areImagesLoading,
    refreshImages,
  } = useImagesContext();
  const bodyEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const { showImageSuggestions } = useImageCompletion({
    images,
    isImagesLoading: areImagesLoading,
    monaco,
    editorRef: bodyEditorRef,
  });
  const handleImagePaste = useImagePaste({ refreshImages });

  useImperativeHandle(
    ref,
    () => ({
      getSelectionOffsets: () => {
        const bodyEditor = bodyEditorRef.current;
        const model = bodyEditor?.getModel();
        const selection = bodyEditor?.getSelection();
        if (!model || !selection) {
          return { start: value.length, end: value.length };
        }
        return {
          start: model.getOffsetAt(selection.getStartPosition()),
          end: model.getOffsetAt(selection.getEndPosition()),
        };
      },
      focusAtOffset: (offset) => {
        const bodyEditor = bodyEditorRef.current;
        const model = bodyEditor?.getModel();
        if (!bodyEditor || !model) return;
        bodyEditor.focus();
        bodyEditor.setPosition(
          model.getPositionAt(Math.min(offset, model.getValueLength())),
        );
      },
    }),
    [value.length],
  );

  const handleMount: OnMount = (bodyEditor, mountedMonaco) => {
    bodyEditorRef.current = bodyEditor;
    setMonaco(mountedMonaco);
    bodyEditor.onDidChangeModelContent((event) => {
      if (!event.changes.some((change) => change.text.endsWith("!"))) return;
      requestAnimationFrame(() => {
        showImageSuggestions(bodyEditor, mountedMonaco, "!");
      });
    });

    const handlePaste = (event: ClipboardEvent) => {
      if (!bodyEditor.hasTextFocus()) return;

      handleImagePaste(bodyEditor, event);
    };

    window.addEventListener("paste", handlePaste, true);
    bodyEditor.onDidDispose(() => {
      window.removeEventListener("paste", handlePaste, true);
    });
  };

  return (
    <MonacoEditor
      height={height}
      language="markdown"
      value={value}
      onChange={(nextValue) => onChange(nextValue ?? "")}
      onMount={handleMount}
      options={{
        automaticLayout: true,
        fontSize: 16,
        minimap: { enabled: false },
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
        wordWrap: "on",
      }}
    />
  );
});

export default BlogMarkdownEditor;
