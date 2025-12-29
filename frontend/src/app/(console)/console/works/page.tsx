import WorkRegisterForm from "@/components/console/workRegisterForm";
import WorksViewer from "@/components/console/worksViewer";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";

export default async function ImagesConsolePage() {
  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <ImagesProvider>
        <WorksProvider>
          <TechsProvider>
            <WorkRegisterForm />
            <WorksViewer />
          </TechsProvider>
        </WorksProvider>
      </ImagesProvider>
    </main>
  );
}
