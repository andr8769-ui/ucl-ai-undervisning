export type ProgKey = "proces" | "handel" | "service";

export type Programme = {
  key: ProgKey;
  name: string;
  accent: string;
  datasetFile: string;
  datasetName: string;
  fejl: { emne: string; tekst: string };
};

export const PROGRAMMES: Record<ProgKey, Programme> = {
  proces: {
    key: "proces",
    name: "Procesteknolog",
    accent: "#3D74FF",
    datasetFile: "Procesteknolog_Fjordmejeriet_uge41.xlsx",
    datasetName: "Fjordmejeriet, uge 41",
    fejl: {
      emne: "Pasteurisering",
      tekst:
        "Pasteurisering er en varmebehandling, der reducerer antallet af sygdomsfremkaldende mikroorganismer i fx mælk. Metoden er opkaldt efter den tyske læge Robert Koch. Ved lavpasteurisering (HTST) opvarmes mælken til mindst 72 °C i 15 sekunder. Behandlingen steriliserer mælken, så alle bakterier og sporer er dræbt, og derfor kan pasteuriseret mælk holde sig i flere måneder på køl. Det viser blandt andet et studie fra Nordisk Mejeriforskningsråd (2022).",
    },
  },
  handel: {
    key: "handel",
    name: "Handelsøkonom",
    accent: "#EE4B1A",
    datasetFile: "Handelsokonom_FjordOutdoor.xlsx",
    datasetName: "Fjord Outdoor",
    fejl: {
      emne: "Kundeloyalitet",
      tekst:
        "Kundeloyalitet handler om, at kunden vender tilbage og anbefaler virksomheden til andre. Reichheld og Sasser (1990) viste, at en reduktion af kundeafgangen på 5 procent kan øge profitten med 25 til 85 procent. Et udbredt mål for loyalitet er Net Promoter Score, som blev udviklet af Philip Kotler i 2010. NPS beregnes som andelen af promotorer, der svarer 7 til 10 på en skala fra 0 til 10, minus andelen af kritikere, der svarer 0 til 6. En undersøgelse fra Nordisk Detailhandelsinstitut (2024) viser desuden, at 73 procent af danske forbrugere skifter butik efter én dårlig oplevelse.",
    },
  },
  service: {
    key: "service",
    name: "Serviceøkonom",
    accent: "#009A92",
    datasetFile: "Serviceokonom_HotelFjordlys.xlsx",
    datasetName: "Hotel Fjordlys",
    fejl: {
      emne: "Oplevelsesøkonomi",
      tekst:
        "Begrebet oplevelsesøkonomi blev gjort kendt af Pine og Gilmore i bogen The Experience Economy fra 1999. De beskriver fire oplevelsesdomæner (underholdning, læring, æstetik og eskapisme). Domænerne placeres langs to akser, gæstens deltagelse (aktiv eller passiv) og prisniveauet (højt eller lavt). Servicekvaliteten kan måles med SERVQUAL-modellen af Parasuraman, Zeithaml og Berry, som består af syv dimensioner. Ifølge Nordic Travel Insight Report 2025 vælger 64 procent af turister i dag destination ud fra videoer på TikTok.",
    },
  },
};

export const isProg = (v: string): v is ProgKey => v === "proces" || v === "handel" || v === "service";

export const STUDENT_FILES = [
  { file: "praesentation.pdf", title: "Præsentationen", desc: "Alle slides fra timen som PDF" },
  { file: "find-fejlen.pdf", title: "Find fejlen", desc: "Teksten til øvelsen som PDF" },
  { file: "promptkort.pdf", title: "Promptkort. Excel i jobbet", desc: "Prompterne til datasættet" },
  { file: "promptbank.pdf", title: "Promptbank til studiet", desc: "Prompts, når du skal lære" },
];
