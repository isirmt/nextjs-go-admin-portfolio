"use client";

import dynamic from "next/dynamic";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Monaco, OnMount } from "@monaco-editor/react";
import type { editor, IPosition, languages } from "monaco-editor";
import { useImagesContext } from "@/contexts/imagesContext";

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
};

const BlogMarkdownEditor = forwardRef<
  BlogMarkdownEditorHandle,
  BlogMarkdownEditorProps
>(function BlogMarkdownEditor({ value, onChange }, ref) {
  const { images, isLoading: areImagesLoading } = useImagesContext();
  const bodyEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [monaco, setMonaco] = useState<Monaco | null>(null);

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

  const showImageSuggestions = useCallback(
    (
      bodyEditor: editor.IStandaloneCodeEditor,
      monacoInstance: Monaco,
      triggerCharacter?: string,
    ) => {
      bodyEditor.trigger(
        "blog-image-completion",
        "editor.action.triggerSuggest",
        {
          ...(triggerCharacter
            ? {
                triggerKind:
                  monacoInstance.languages.CompletionTriggerKind
                    .TriggerCharacter,
                triggerCharacter,
              }
            : {}),
        },
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const isDetailsVisible = bodyEditor
            .getDomNode()
            ?.querySelector(".suggest-widget")
            ?.classList.contains("shows-details");
          if (isDetailsVisible) return;
          bodyEditor.trigger(
            "blog-image-completion",
            "toggleSuggestionDetails",
            undefined,
          );
        });
      });
    },
    [],
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
  };

  useEffect(() => {
    if (!monaco) return;

    const completionProvider = monaco.languages.registerCompletionItemProvider(
      "markdown",
      {
        triggerCharacters: ["!"],
        provideCompletionItems(
          model: editor.ITextModel,
          position: IPosition,
          context: languages.CompletionContext,
        ) {
          const lineBeforeCursor = model
            .getLineContent(position.lineNumber)
            .slice(0, position.column - 1);
          const trigger =
            lineBeforeCursor.match(/![^\s!]*$/)?.[0] ??
            (context.triggerCharacter === "!" ? "!" : undefined);
          if (!trigger) return { suggestions: [] };

          const range = new monaco.Range(
            position.lineNumber,
            position.column - trigger.length,
            position.lineNumber,
            position.column,
          );
          return {
            suggestions: images.map((image, index) => {
              const imageURL = `/api/images/${image.id}/raw`;
              const documentationImageURL = new URL(
                imageURL,
                window.location.origin,
              ).toString();
              return {
                label: image.file_name,
                kind: monaco.languages.CompletionItemKind.File,
                detail: `画像: ${image.file_name}`,
                documentation: {
                  value: `![画像](${documentationImageURL})\n\n\`${image.id}\`\n\n\`![画像](${imageURL})\``,
                },
                filterText: `!${image.file_name} ${image.id}`,
                insertText: `![画像](${imageURL})`,
                range,
                sortText: String(index).padStart(6, "0"),
              };
            }),
          };
        },
      },
    );

    return () => completionProvider.dispose();
  }, [images, monaco]);

  useEffect(() => {
    if (areImagesLoading || images.length === 0 || !monaco) return;

    const bodyEditor = bodyEditorRef.current;
    const model = bodyEditor?.getModel();
    const position = bodyEditor?.getPosition();
    if (!bodyEditor || !model || !position) return;

    const lineBeforeCursor = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);
    if (!/![^\s!]*$/.test(lineBeforeCursor)) return;

    showImageSuggestions(bodyEditor, monaco);
  }, [areImagesLoading, images, monaco, showImageSuggestions]);

  return (
    <MonacoEditor
      height="36rem"
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
