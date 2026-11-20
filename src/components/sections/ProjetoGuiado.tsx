import { getSiteSettings, getTracking } from "@/lib/data";
import { instagramHandle } from "@/lib/utils";

import { ProjetoGuiadoClient } from "./projeto/ProjetoGuiadoClient";

export async function ProjetoGuiado({ fundo = "claro" }: { fundo?: "claro" | "alternado" } = {}) {
  const [settings, tracking] = await Promise.all([getSiteSettings(), getTracking()]);
  const instagramUrl = settings.redes.instagram || "https://instagram.com/technologiesarka";

  return (
    <ProjetoGuiadoClient
      fundo={fundo}
      whatsappDigitos={settings.contato.whatsappDigitos}
      instagramUrl={instagramUrl}
      instagramHandle={instagramHandle(instagramUrl) ?? "technologiesarka"}
      googleAdsConversao={tracking.googleAdsConversao}
    />
  );
}
