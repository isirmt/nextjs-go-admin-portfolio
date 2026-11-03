import ConsoleSidebar from "@/components/console/sidebar";
import ConsoleHeader from "@/components/console/header";
import ConsoleSessionProvider from "@/components/providers/consoleSessionProvider";
import { HamburgerProvider } from "@/contexts/hamburgerContext";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleSessionProvider>
      <HamburgerProvider>
        <div className="min-h-dvh bg-background font-sans text-foreground">
          <ConsoleHeader />
          <div className="relative flex min-h-dvh lg:pl-72">
            <ConsoleSidebar />
            {children}
          </div>
        </div>
      </HamburgerProvider>
    </ConsoleSessionProvider>
  );
}
