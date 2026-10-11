"use client";

import { CommonImage } from "@/types/images/common";
import backendApi from "@/lib/auth/backendFetch";
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

type ImagesProviderProps = {
  children: React.ReactNode;
  access?: "public" | "admin";
};

export function ImagesProvider({
  children,
  access = "public",
}: ImagesProviderProps) {
  const [images, setImages] = useState<CommonImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response: Response;
      if (access === "admin") {
        response = await backendApi("/images");
        if (response.status === 401 || response.status === 403)
          response = await fetch("/api/images");
      } else {
        response = await fetch("/api/images");
      }
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
  }, [access]);

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
