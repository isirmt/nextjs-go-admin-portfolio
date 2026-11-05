"use client";

import { useCallback, useEffect, type RefObject } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor, IPosition, languages } from "monaco-editor";
import type { CommonImage } from "@/types/images/common";

type UseImageCompletionOptions = {
  images: CommonImage[];
  isImagesLoading: boolean;
  monaco: Monaco | null;
  editorRef: RefObject<editor.IStandaloneCodeEditor | null>;
};

export default function useImageCompletion({
  images,
  isImagesLoading,
  monaco,
  editorRef,
}: UseImageCompletionOptions) {
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
    if (isImagesLoading || images.length === 0 || !monaco) return;

    const bodyEditor = editorRef.current;
    const model = bodyEditor?.getModel();
    const position = bodyEditor?.getPosition();
    if (!bodyEditor || !model || !position) return;

    const lineBeforeCursor = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);
    if (!/![^\s!]*$/.test(lineBeforeCursor)) return;

    showImageSuggestions(bodyEditor, monaco);
  }, [editorRef, images, isImagesLoading, monaco, showImageSuggestions]);

  return { showImageSuggestions };
}
