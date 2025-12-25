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

export type WorkTechStack = {
  id: string;
  tech_stack_id: string;
};

export type Work = {
  id: string;
  title: string;
  comment: string;
  created_at: string;
  accent_color: string;
  description: string | null;
  thumbnail_image_id: string | null;
  images: WorkImage[];
  urls: WorkUrl[];
  tech_stacks: WorkTechStack[];
};
