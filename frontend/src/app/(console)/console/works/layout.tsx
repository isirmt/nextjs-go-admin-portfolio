import type { ReactNode } from "react";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";

export default function WorksLayout({ children }: { children: ReactNode }) {
  return (
    <ImagesProvider access="admin">
      <WorksProvider>
        <TechsProvider>{children}</TechsProvider>
      </WorksProvider>
    </ImagesProvider>
  );
}
