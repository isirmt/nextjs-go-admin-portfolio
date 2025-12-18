import DAndDContentBox from "@/components/console/dAndDContentBox";
import { auth } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export default async function ImagesConsolePage() {
  const session = await auth();

  if (!session) {
    redirect("/console/login");
  }

  return <main className="w-full relative">
    <DAndDContentBox />
  </main>;
}
