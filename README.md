# Tænk selv. Brug AI.

Undervisningsprogram til AI-timerne på UCL Vejle for serviceøkonomer, handelsøkonomer og procesteknologer.

## Det kan programmet

**Studerende** går ind på forsiden og skriver holdkode og brugernavn. De kan

* udfylde "Find fejlen" direkte i programmet. Svaret gemmes løbende som kladde og afleveres med én knap
* se Excel-datasættet direkte i browseren og hente filen
* åbne promptkort, promptbank og Find fejlen som PDF
* stille spørgsmål, der dukker op som pop-up i præsentationen

**Underviseren** går ind på `/laerer` og logger ind med lærerkoden. Herfra kan du

* oprette en session med uddannelse, hold og dato. Programmet laver holdkode og QR-kode
* følge afleveringer og spørgsmål live, med facit ved siden af svarene
* åbne **Præsentér** (slides i fuld skærm med pop-ups) og **Talerskærm** (talernoter, næste slide og spørgsmål) i hvert sit vindue
* hente præsentationen som .pptx og undervisningsplanen med facit

### Taster i præsentationen

| Tast | Funktion |
| --- | --- |
| Pil højre, mellemrum | Næste slide |
| Pil venstre | Forrige slide |
| F | Fuld skærm |
| K | Vis holdkode og QR-kode |
| Q | Vis alle åbne spørgsmål |
| Esc | Luk overlay og pop-ups |

## Teknik

* Next.js 15 på Vercel
* Supabase (Postgres) til sessioner, deltagere, afleveringer og spørgsmål
* Al databaseadgang sker fra serveren. Databasens adgangsregler kræver en hemmelig header, så publishable-nøglen alene giver ingen adgang
* Slides, talernoter, .pptx og undervisningsplan ligger i `private/` og kan kun hentes af en logget ind underviser
* Studiemateriale og datasæt ligger i `public/p/<uddannelse>/`

## Miljøvariabler

Se `.env.example`. Lærerkoden ændres i Vercel under Settings → Environment Variables → `TEACHER_CODE`, efterfulgt af en ny deploy.

## Opdatér materialet

Udskift filerne i `private/<uddannelse>/` og `public/p/<uddannelse>/`, og push til GitHub. Vercel deployer automatisk.
