import SessionButton from "@/components/console/sessionButton";
import { auth } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export default async function ConsoleLoginPage() {
  const session = await auth();
  if (session) {
    redirect("/console");
  }

  return (
    <main>
      <div>Google OAuthによるログイン</div>
      <SessionButton />
    </main>
  );
}
