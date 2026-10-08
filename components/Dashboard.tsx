"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionRow } from "@/lib/db";
import { PROGRAMMES, ProgKey } from "@/lib/programmes";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtDate = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });

export default function Dashboard({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [programme, setProgramme] = useState<ProgKey>("proces");
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/laerer/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ programme, class_name: className, session_date: date }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error || "Sessionen blev ikke oprettet.");
    router.push(`/laerer/${d.id}`);
  }

  async function logout() {
    await fetch("/api/laerer/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <Link href="/laerer" className="brand">UCL Vejle · AI <span className="muted" style={{ fontWeight: 600 }}>Underviser</span></Link>
          <div style={{ display: "flex", gap: 10 }}>
            <a className="btn ghost small" href="/api/laerer/fil/plan" target="_blank" rel="noreferrer">Undervisningsplan</a>
            <button className="btn ghost small" onClick={logout}>Log ud</button>
          </div>
        </div>
      </div>
      <main className="wrap" style={{ paddingBottom: 80 }}>
        <div className="page-head">
          <div>
            <div className="eyebrow">Ny session</div>
            <h1 style={{ marginTop: 10 }}>Hvilket hold i dag?</h1>
          </div>
        </div>
        <form onSubmit={create} className="panel" style={{ marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 200px auto", gap: 20, alignItems: "end" }} className="createrow">
            <div className="field" style={{ margin: 0 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Uddannelse</span>
              <div className="seg" role="group">
                {(Object.keys(PROGRAMMES) as ProgKey[]).map((k) => (
                  <button key={k} type="button" aria-pressed={programme === k} onClick={() => setProgramme(k)}>{PROGRAMMES[k].name}</button>
                ))}
              </div>
            </div>
            <label className="field" style={{ margin: 0 }}>
              <span>Hold</span>
              <input className="input" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Fx PT 1. semester, hold B" maxLength={60} required />
            </label>
            <label className="field" style={{ margin: 0 }}>
              <span>Dato</span>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <button className="btn" type="submit" disabled={busy}>{busy ? "Opretter" : "Opret session"}</button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
        <style>{`@media (max-width: 960px) { .createrow { grid-template-columns: 1fr !important; } }`}</style>

        <div className="page-head" style={{ paddingTop: 56 }}>
          <div><div className="eyebrow">Sessioner</div></div>
        </div>
        {sessions.length === 0 ? (
          <p className="muted">Ingen sessioner endnu. Opret den første ovenfor.</p>
        ) : (
          <div className="sessionlist">
            {sessions.map((s) => (
              <Link key={s.id} href={`/laerer/${s.id}`} className="srow" style={{ ["--accent" as string]: PROGRAMMES[s.programme].accent }}>
                <span className="muted">{fmtDate(s.session_date)}</span>
                <span><span className="dot" /><b>{PROGRAMMES[s.programme].name}</b> <span className="muted">· {s.class_name}</span></span>
                <span className="code">{s.code}</span>
                <span className={s.status === "open" ? "status-pill ok" : "status-pill"} style={{ justifySelf: "start" }}>{s.status === "open" ? "Åben" : "Lukket"}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
