import { ReactNode } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FloatingCTA } from "@/components/landing/conversion/FloatingCTA";
import { StickyCtaBanner } from "@/components/landing/conversion/StickyCtaBanner";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StickyCtaBanner />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
};
