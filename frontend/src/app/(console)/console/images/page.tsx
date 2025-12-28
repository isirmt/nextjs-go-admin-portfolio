import DndContentBox from "@/components/console/dndContentBox";
import ImagesViewer from "@/components/console/imagesViewer";
import { ImagesProvider } from "@/contexts/imagesContext";

export default async function ImagesConsolePage() {
  return (
    <main className="relative w-full space-y-8 px-16 py-8">
      <ImagesProvider>
        <DndContentBox />
        <ImagesViewer />
      </ImagesProvider>
    </main>
  );
}
