/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { ImagePlusIcon } from "lucide-react";
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

export default function ConsoleImagePicker({
  label,
  selectedIds,
  selectionMode,
  onChange,
}: ConsoleImagePickerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isSingle = selectionMode === "single";
  const hasSelection = selectedIds.length > 0;

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedIds.map((imageId) => (
                <img
                  key={imageId}
                  src={`/api/images/${imageId}/raw`}
                  alt=""
                  className="bg-muted aspect-square w-full rounded-lg object-contain"
                />
              ))}
            </div>
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
