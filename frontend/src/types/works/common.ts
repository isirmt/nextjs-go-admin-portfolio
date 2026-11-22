import type { CommonTechStack } from "@/types/techStacks/common";
import type { SearchMatch } from "@/types/search/common";

export type WorkImage = {
  id: string;
  image_id: string;
  display_order: number;
};

export type WorkUrl = {
  id: string;
  url: string;
  label: string;
  display_order: number;
};

export type WorkTechStack = CommonTechStack;

export type Work = {
  id: string;
  title: string;
  comment: string;
  created_at: string;
  accent_color: string;
  description: string | null;
  search_match?: SearchMatch;
  thumbnail_image_id: string | null;
  images: WorkImage[];
  urls: WorkUrl[];
  tech_stacks: WorkTechStack[];
};
