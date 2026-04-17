import { ReactNode } from "react";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { ProgressProvider } from "@/context/UserProgressContext";
import FloatingSupport from "@/components/FloatingSupport";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider>
      {/* Wrapper ini menggantikan class flex/min-h-screen yang tadinya ada di body */}
      <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
        <Navbar />

        <main className="flex-1 w-full flex flex-col">{children}</main>

        <FloatingSupport />
        <MobileNav />
      </div>
    </ProgressProvider>
  );
}
