import "server-only";
import type { ProgKey } from "./programmes";

// Kun til underviseren. Importeres udelukkende fra serverkode.
export const FACIT: Record<ProgKey, string[]> = {
  proces: [
    "Metoden er opkaldt efter franskmanden Louis Pasteur, ikke Robert Koch.",
    "Pasteurisering steriliserer ikke. Sporer overlever, og mælken har kort holdbarhed og skal på køl.",
    "Nordisk Mejeriforskningsråd og studiet findes ikke. Korrekt i teksten er mindst 72 °C i 15 sekunder.",
  ],
  handel: [
    "NPS blev udviklet af Fred Reichheld i 2003, ikke af Philip Kotler i 2010.",
    "Promotorer svarer 9 til 10. Svar på 7 til 8 er passive.",
    "Nordisk Detailhandelsinstitut og tallet 73 procent findes ikke. Korrekt i teksten er Reichheld og Sasser 1990.",
  ],
  service: [
    "Den anden akse handler om gæstens forbindelse til oplevelsen (absorption eller immersion), ikke om pris.",
    "SERVQUAL har fem dimensioner, ikke syv.",
    "Nordic Travel Insight Report 2025 findes ikke. Korrekt i teksten er Pine og Gilmore 1999 og de fire domæner.",
  ],
};
