import WorkRegisterForm from "@/components/console/workRegisterForm";
import WorksViewer from "@/components/console/worksViewer";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";
import sessionChecker from "@/lib/console/sessionChecker";

export default async function ImagesConsolePage() {
  await sessionChecker();
  return (
    <main className="relative w-full space-y-8 px-16 py-8">
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
