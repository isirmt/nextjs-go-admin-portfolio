/* eslint-disable @next/next/no-img-element */
"use client";

import {
  DragDropProvider,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { ImagePlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import ImageSelectingDialog from "./imageSelectingDialog";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";

type ConsoleImagePickerProps = {
  label: string;
  selectedIds: string[];
  selectionMode: "single" | "multiple";
  onChange: (ids: string[]) => void;
};

type SortableSelectedImageProps = {
  imageId: string;
  index: number;
};

function SortableSelectedImage({ imageId, index }: SortableSelectedImageProps) {
  const { ref, isDragging } = useSortable({
    id: imageId,
    index,
  });

  return (
    <div
      ref={ref}
      className={`bg-muted relative aspect-square cursor-grab touch-none overflow-hidden rounded-lg active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <img
        src={`/api/images/${imageId}/raw`}
        alt=""
        className="pointer-events-none size-full object-contain select-none"
      />
    </div>
  );
}

export default function ConsoleImagePicker({
  label,
  selectedIds,
  selectionMode,
  onChange,
}: ConsoleImagePickerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isSingle = selectionMode === "single";
  const hasSelection = selectedIds.length > 0;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return;

      const { source } = event.operation;
      if (!isSortable(source) || source.initialIndex === source.index) return;

      const nextSelectedIds = [...selectedIds];
      const [movedImageId] = nextSelectedIds.splice(source.initialIndex, 1);
      nextSelectedIds.splice(source.index, 0, movedImageId);
      onChange(nextSelectedIds);
    },
    [onChange, selectedIds],
  );

  return (
    <Card size="sm" className="w-full rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardAction className="flex items-center gap-2">
          {hasSelection ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
            >
              解除
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <ImagePlusIcon />
            {hasSelection ? "変更" : "画像を選択"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {hasSelection ? (
          isSingle ? (
            <img
              src={`/api/images/${selectedIds[0]}/raw`}
              alt=""
              className="bg-muted aspect-square w-full max-w-81 rounded-lg object-contain"
            />
          ) : (
            <DragDropProvider
              sensors={[PointerSensor]}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedIds.map((imageId, index) => (
                  <SortableSelectedImage
                    key={imageId}
                    imageId={imageId}
                    index={index}
                  />
                ))}
              </div>
            </DragDropProvider>
          )
        ) : (
          <p className="bg-muted/50 text-muted-foreground rounded-lg px-4 py-8 text-center text-sm">
            画像が選択されていません
          </p>
        )}
      </CardContent>
      <ImageSelectingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialSelectedIds={selectedIds}
        multiple={!isSingle}
        onSelect={(ids) => onChange(isSingle ? ids.slice(0, 1) : ids)}
      />
    </Card>
  );
}
