import sessionChecker from "@/lib/console/sessionChecker";

export default async function HomeConsole() {
  await sessionChecker();
  return <main>Console Page</main>;
}
