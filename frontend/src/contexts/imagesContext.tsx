"use client";

import { CommonImage } from "@/types/images/common";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ImagesContextValue = {
  images: CommonImage[];
  isLoading: boolean;
  error: string | null;
  refreshImages: () => Promise<void>;
};

const ImagesContext = createContext<ImagesContextValue | null>(null);

export function ImagesProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<CommonImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/images");
      if (!response.ok) throw new Error("画像の取得に失敗しました");
      const parsedImages = (await response.json()) as CommonImage[];
      setImages(parsedImages);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "画像の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const value = useMemo(
    () => ({ images, isLoading, error, refreshImages: fetchImages }),
    [images, isLoading, error, fetchImages],
  );

  return (
    <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>
  );
}

export function useImagesContext() {
  const context = useContext(ImagesContext);
  if (!context)
    throw new Error("useImagesContext must be used within ImagesProvider");
  return context;
}
