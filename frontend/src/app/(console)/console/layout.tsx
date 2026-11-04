import ConsoleHeader from "@/components/console/header";
import ConsoleShell from "@/components/console/consoleShell";
import ConsoleSessionProvider from "@/components/providers/consoleSessionProvider";
import { Toaster } from "@/components/shadcn/ui/sonner";
import { HamburgerProvider } from "@/contexts/hamburgerContext";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleSessionProvider>
      <HamburgerProvider>
        <div className="bg-background text-foreground min-h-dvh font-sans">
          <ConsoleHeader />
          <ConsoleShell>{children}</ConsoleShell>
          <Toaster position="top-center" />
        </div>
      </HamburgerProvider>
    </ConsoleSessionProvider>
  );
}
