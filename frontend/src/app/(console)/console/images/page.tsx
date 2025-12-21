import DndContentBox from "@/components/console/dndContentBox";
import ImagesViewer from "@/components/console/imagesViewer";
import { ImagesProvider } from "@/contexts/imagesContext";
import sessionChecker from "@/lib/console/sessionChecker";

export default async function ImagesConsolePage() {
  await sessionChecker();
  return (
    <main className="relative w-full space-y-8 px-16 py-8">
      <ImagesProvider>
        <DndContentBox />
        <ImagesViewer />
      </ImagesProvider>
    </main>
  );
}
