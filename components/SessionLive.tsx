"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionRow } from "@/lib/db";
import type { Programme } from "@/lib/programmes";
import { STUDENT_FILES } from "@/lib/programmes";

type Participant = { id: string; username: string; created_at: string };
type Submission = { participant_id: string; answers: Record<string, string>; submitted_at: string | null; updated_at: string };
type Question = { id: string; username: string; body: string; status: "new" | "shown" | "done"; created_at: string };
type Data = { session: SessionRow; participants: Participant[]; submissions: Submission[]; questions: Question[] };

const t = (iso: string) => new Date(iso).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");

export default function SessionLive({ session, prog, facit, host, qrSvg }: { session: SessionRow; prog: Programme; facit: string[]; host: string; qrSvg: string }) {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<"svar" | "spm" | "filer">("svar");
  const [status, setStatus] = useState(session.status);

  const load = useCallback(async () => {
    const res = await fetch(`/api/laerer/sessions/${session.id}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [session.id]);

  useEffect(() => {
    load();
    const iv = setInterval(() => { if (!document.hidden) load(); }, 4000);
    return () => clearInterval(iv);
  }, [load]);

  async function toggleStatus() {
    const next = status === "open" ? "closed" : "open";
    const res = await fetch(`/api/laerer/sessions/${session.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (res.ok) setStatus(next);
  }
  async function remove() {
    if (!confirm("Slet sessionen med alle afleveringer og spørgsmål? Det kan ikke fortrydes.")) return;
    const res = await fetch(`/api/laerer/sessions/${session.id}`, { method: "DELETE" });
    if (res.ok) router.push("/laerer");
  }
  async function markQ(id: string, st: Question["status"]) {
    await fetch(`/api/laerer/spoergsmaal/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: st }) });
    load();
  }
  const openWin = (path: string, name: string) => window.open(path, name);

  const subs = new Map((data?.submissions ?? []).map((s) => [s.participant_id, s]));
  const delivered = (data?.submissions ?? []).filter((s) => s.submitted_at).length;
  const openQs = (data?.questions ?? []).filter((q) => q.status !== "done").length;
  const dateLabel = new Date(session.session_date + "T12:00:00").toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <Link href="/laerer" className="brand">← Sessioner</Link>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn accent small" onClick={() => openWin(`/laerer/${session.id}/praesenter`, `pres-${session.id}`)}>Præsentér</button>
            <button className="btn ghost small" onClick={() => openWin(`/laerer/${session.id}/taler`, `taler-${session.id}`)}>Talerskærm</button>
          </div>
        </div>
      </div>
      <main className="wrap" style={{ paddingBottom: 80 }}>
        <div className="page-head">
          <div>
            <div className="eyebrow"><span className="dot" />{prog.name} · {dateLabel}</div>
            <h1 style={{ marginTop: 10 }}>{session.class_name}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className={status === "open" ? "status-pill ok" : "status-pill"}>{status === "open" ? "Åben for afleveringer" : "Lukket"}</span>
            <button className="btn ghost small" onClick={toggleStatus}>{status === "open" ? "Luk holdet" : "Åbn holdet"}</button>
          </div>
        </div>

        <div className="joinbox">
          <div>
            <div className="eyebrow" style={{ color: "#a1a1a6" }}>Gå ind på {host} og skriv</div>
            <div className="bigcode" style={{ marginTop: 12 }}>{session.code}</div>
            <div style={{ color: "#a1a1a6", marginTop: 14 }}>{data ? `${data.participants.length} deltagere · ${delivered} afleveret · ${openQs} åbne spørgsmål` : "Henter"}</div>
          </div>
          <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </div>

        <div className="tabs" role="tablist">
          <button className="tab" role="tab" aria-selected={tab === "svar"} onClick={() => setTab("svar")}>Find fejlen{delivered > 0 && <span className="badge">{delivered}</span>}</button>
          <button className="tab" role="tab" aria-selected={tab === "spm"} onClick={() => setTab("spm")}>Spørgsmål{openQs > 0 && <span className="badge">{openQs}</span>}</button>
          <button className="tab" role="tab" aria-selected={tab === "filer"} onClick={() => setTab("filer")}>Materialer</button>
        </div>

        {tab === "svar" && (
          <section>
            <div className="facit">
              <div className="eyebrow" style={{ color: "var(--ok)" }}>Facit · {prog.fejl.emne}</div>
              <ol>{facit.map((f, i) => <li key={i}>{f}</li>)}</ol>
            </div>
            {!data ? <p className="muted">Henter</p> : data.participants.length === 0 ? (
              <p className="muted">Ingen deltagere endnu. Del holdkoden.</p>
            ) : (
              data.participants.map((p) => {
                const s = subs.get(p.id);
                const a = s?.answers ?? {};
                return (
                  <div className="answer" key={p.id}>
                    <header>
                      <b>{p.username}</b>
                      {s?.submitted_at ? <span className="status-pill ok">Afleveret {t(s.submitted_at)}</span> : s ? <span className="status-pill">Kladde</span> : <span className="status-pill">Ikke startet</span>}
                    </header>
                    {s && (
                      <div className="cols">
                        <div><span>Fejl 1</span>{a.fejl1 || <i className="muted">tom</i>}</div>
                        <div><span>Fejl 2</span>{a.fejl2 || <i className="muted">tom</i>}</div>
                        <div><span>Fejl 3</span>{a.fejl3 || <i className="muted">tom</i>}</div>
                        <div><span>Sådan tjekkede vi</span>{a.tjek || <i className="muted">tom</i>}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        )}

        {tab === "spm" && (
          <section>
            {!data ? <p className="muted">Henter</p> : data.questions.length === 0 ? <p className="muted">Ingen spørgsmål endnu.</p> : (
              [...data.questions].reverse().map((q) => (
                <div className={`qrow ${q.status === "done" ? "done" : ""}`} key={q.id}>
                  <div>
                    <div className="eyebrow">{q.username} · {t(q.created_at)}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{q.body}</div>
                  </div>
                  {q.status !== "done" ? <button className="btn ghost small" onClick={() => markQ(q.id, "done")}>Besvaret</button> : <button className="btn ghost small" onClick={() => markQ(q.id, "shown")}>Genåbn</button>}
                </div>
              ))
            )}
          </section>
        )}

        {tab === "filer" && (
          <section className="files">
            <div className="filerow"><div><h3>Præsentationen med talernoter</h3><div className="muted">PowerPoint. Kun til dig</div></div><a className="btn small" href={`/api/laerer/fil/${prog.key}`}>Hent .pptx</a></div>
            <div className="filerow"><div><h3>Undervisningsplan med facit</h3><div className="muted">Kun til dig</div></div><a className="btn ghost small" href="/api/laerer/fil/plan" target="_blank" rel="noreferrer">Åbn PDF</a></div>
            <div className="filerow"><div><h3>Datasæt. {prog.datasetName}</h3><div className="muted">Samme fil som de studerende henter</div></div><a className="btn ghost small" href={`/p/${prog.key}/filer/${prog.datasetFile}`} download>Hent Excel</a></div>
            {STUDENT_FILES.map((f) => (
              <div className="filerow" key={f.file}><div><h3>{f.title}</h3><div className="muted">Til de studerende</div></div><a className="btn ghost small" href={`/p/${prog.key}/filer/${f.file}`} target="_blank" rel="noreferrer">Åbn PDF</a></div>
            ))}
            <div style={{ marginTop: 40 }}><button className="btn danger small" onClick={remove}>Slet session</button></div>
          </section>
        )}
      </main>
    </>
  );
}
