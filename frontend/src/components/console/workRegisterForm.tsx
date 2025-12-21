"use client";

import React, { useCallback, useState } from "react";
import ImageSelectingBox from "./imageSelectingBox";
import StackSelectingBox from "./stackSelectingBox";
import { LabelBox, LabelText } from "./labelBlock";

export default function WorkRegisterForm() {
  const [inputSlug, setInputSlug] = useState<string>("");
  const [inputTitle, setInputTitle] = useState<string>("");
  const [inputComment, setInputComment] = useState<string>("");
  const [inputPublishedDate, setInputPublishedDate] = useState<string>("");
  const [inputAccentColor, setInputAccentColor] = useState<string>("#000000");
  const [inputThumbnailImage, setInputThumbnailImage] = useState<string>("");
  const [inputWorkImages, setInputWorkImages] = useState<string[]>([]);
  const [inputTechStacks, setInputTechStacks] = useState<string[]>([]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  const handleThumbnailSelected = useCallback((id: string[]) => {
    setInputThumbnailImage(id[0] ?? "");
  }, []);

  const handleWorkImagesSelected = useCallback((ids: string[]) => {
    setInputWorkImages(ids);
  }, []);

  const handleTechStacksSelected = useCallback((ids: string[]) => {
    setInputTechStacks(ids);
  }, []);

  return (
    <section className="relative flex w-full flex-col space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LabelBox>
            <LabelText required>識別パス</LabelText>
            <input
              name="slug"
              value={inputSlug}
              onChange={(e) => setInputSlug(e.target.value)}
              required
              placeholder="work_name"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox>
            <LabelText required>制作物名</LabelText>
            <input
              name="title"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              required
              placeholder="アプリケーション名"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>コメント</LabelText>
            <input
              name="comment"
              value={inputComment}
              onChange={(e) => setInputComment(e.target.value)}
              required
              placeholder="ここに一言コメント！"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>技術構成</LabelText>
            <StackSelectingBox onChange={handleTechStacksSelected} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>関連リンク</LabelText>
          </LabelBox>
          <LabelBox>
            <LabelText required>作成日</LabelText>
            <input
              name="published_date"
              value={inputPublishedDate}
              onChange={(e) => setInputPublishedDate(e.target.value)}
              type="date"
              required
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox>
            <LabelText required>アクセントカラー</LabelText>
            <input
              name="accent_color"
              value={inputAccentColor}
              onChange={(e) => setInputAccentColor(e.target.value || "#000000")}
              type="color"
              required
              className="w-full"
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>サムネイル</LabelText>
            <ImageSelectingBox onChange={handleThumbnailSelected} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>参考画像</LabelText>
            <ImageSelectingBox multiple onChange={handleWorkImagesSelected} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>説明</LabelText>
          </LabelBox>
          <LabelBox isLong>
            <input
              type="submit"
              className="relative top-0 block w-full cursor-pointer bg-[#67c8e6] px-4 py-2 text-center text-xl font-bold text-white [box-shadow:0_.15rem_0_0_#67c8e6] transition-all select-none hover:top-[.1rem] hover:bg-[#48a3be] hover:[box-shadow:0_.05rem_0_0_#48a3be]"
            />
          </LabelBox>
        </div>
      </form>
    </section>
  );
}
