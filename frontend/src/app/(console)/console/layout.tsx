import ConsoleSidebar from "@/components/console/sidebar";
import ConsoleHeader from "@/components/console/header";
import ConsoleSessionProvider from "@/components/providers/consoleSessionProvider";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleSessionProvider>
      <ConsoleHeader />
      <div className="relative flex min-h-dvh lg:pl-72">
        <ConsoleSidebar />
        {children}
      </div>
    </ConsoleSessionProvider>
  );
}
