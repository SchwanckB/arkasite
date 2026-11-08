import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Rastreamento } from "@/components/tracking/Rastreamento";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
      <Rastreamento />
    </div>
  );
}
