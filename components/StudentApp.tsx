"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Programme } from "@/lib/programmes";
import { STUDENT_FILES } from "@/lib/programmes";
import FindFejlen from "./FindFejlen";
import DatasetViewer from "./DatasetViewer";
import AskWidget from "./AskWidget";

type Tab = "fejl" | "data" | "filer";

export default function StudentApp({ prog, username, className, date, open }: { prog: Programme; username: string; className: string; date: string; open: boolean }) {
  const [tab, setTab] = useState<Tab>("fejl");
  const router = useRouter();
  const d = new Date(date + "T12:00:00");
  const dateLabel = d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });

  async function logout() {
    await fetch("/api/hold/logud", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span className="brand"><span className="dot" />{prog.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="muted" style={{ fontSize: 14 }}>{username}</span>
            <button className="btn ghost small" onClick={logout}>Log ud</button>
          </div>
        </div>
      </div>
      <main className="wrap" style={{ paddingBottom: 120 }}>
        <div className="student-head">
          <div className="eyebrow">{className} · {dateLabel}</div>
          <h1 style={{ marginTop: 10 }}>Tænk selv. <span className="accent">Brug AI.</span></h1>
          {!open && <p className="error">Holdet er lukket. Du kan se materialet, men ikke aflevere.</p>}
        </div>
        <div className="tabs" role="tablist">
          <button className="tab" role="tab" aria-selected={tab === "fejl"} onClick={() => setTab("fejl")}>Find fejlen</button>
          <button className="tab" role="tab" aria-selected={tab === "data"} onClick={() => setTab("data")}>Datasæt</button>
          <button className="tab" role="tab" aria-selected={tab === "filer"} onClick={() => setTab("filer")}>Materialer</button>
        </div>

        {tab === "fejl" && <FindFejlen prog={prog} open={open} />}
        {tab === "data" && <DatasetViewer prog={prog} />}
        {tab === "filer" && (
          <section>
            <p className="muted" style={{ marginTop: 0 }}>Alt, du skal bruge i timen. Filerne åbner i en ny fane.</p>
            <div className="files">
              <div className="filerow">
                <div><h3>Datasæt. {prog.datasetName}</h3><div className="muted">Excel-filen til hands-on. Upload den til Claude, ChatGPT eller Copilot.</div></div>
                <a className="btn small" href={`/p/${prog.key}/filer/${prog.datasetFile}`} download>Hent Excel</a>
              </div>
              {STUDENT_FILES.map((f) => (
                <div className="filerow" key={f.file}>
                  <div><h3>{f.title}</h3><div className="muted">{f.desc}</div></div>
                  <a className="btn ghost small" href={`/p/${prog.key}/filer/${f.file}`} target="_blank" rel="noreferrer">Åbn PDF</a>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      {open && <AskWidget />}
    </>
  );
}
