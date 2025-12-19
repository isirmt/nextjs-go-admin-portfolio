/* eslint-disable @next/next/no-img-element */
'use client';

import { CommonImage } from "@/types/images/common";
import { useEffect, useState } from "react";


export default function ImagesViewer() {
  const [images, setImages] = useState<CommonImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("/api/images");
      const parsedImages = await response.json() as CommonImage[];
      setImages(parsedImages)
    }

    fetchImages();
  }, [])

  useEffect(() => {
    console.log(images);
  }, [images])

  return <section className="bg-[#f8f8f8] px-4 py-4">
    <div className="flex flex-wrap gap-4">
      {images.map((image, imageIdx) => (
        <button
          className="size-48 bg-white relative"
          key={imageIdx}>
          <img src={`/api/images/${image.id}`} alt={image.file_name} className="size-full object-contain" />
        </button>))}
    </div>
  </section>
}