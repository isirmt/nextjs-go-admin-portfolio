import { redirect } from "next/navigation";
import { auth } from "../auth/options";

export default async function sessionChecker() {
  const session = await auth();

  if (!session) {
    redirect("/console/login");
  }
}
