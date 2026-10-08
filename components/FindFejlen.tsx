"use client";
import { useEffect, useRef, useState } from "react";
import type { Programme } from "@/lib/programmes";

type Answers = { fejl1: string; fejl2: string; fejl3: string; tjek: string };
const EMPTY: Answers = { fejl1: "", fejl2: "", fejl3: "", tjek: "" };

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");

export default function FindFejlen({ prog, open }: { prog: Programme; open: boolean }) {
  const [a, setA] = useState<Answers>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    fetch("/api/hold/svar").then((r) => r.json()).then((d) => {
      setA({ ...EMPTY, ...(d.answers || {}) });
      setSubmittedAt(d.submitted_at || null);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  async function save(next: Answers, submit = false) {
    setState("saving");
    const res = await fetch("/api/hold/svar", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: next, submit }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setState("error"); setMsg(d.error || "Svaret blev ikke gemt."); return false; }
    dirty.current = false;
    setState("saved"); setMsg("");
    if (d.submitted_at) setSubmittedAt(d.submitted_at);
    return true;
  }

  function change(k: keyof Answers, v: string) {
    const next = { ...a, [k]: v };
    setA(next);
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 1200);
  }

  async function submit() {
    if (timer.current) clearTimeout(timer.current);
    await save(a, true);
  }

  const field = (k: keyof Answers, label: string, ph: string) => (
    <label className="field">
      <span>{label}</span>
      <textarea className="textarea" value={a[k]} onChange={(e) => change(k, e.target.value)} placeholder={ph} disabled={!open || !loaded} maxLength={1500} />
    </label>
  );

  return (
    <section className="grid2">
      <div>
        <div className="eyebrow">Teksten</div>
        <h2 style={{ fontSize: 28, margin: "8px 0 16px" }}>{prog.fejl.emne}</h2>
        <div className="quote">{prog.fejl.tekst}</div>
        <p className="muted" style={{ marginTop: 16 }}>Teksten lyder som et typisk AI-svar. Den indeholder tre fejl. Find dem, og skriv, hvordan I tjekkede.</p>
      </div>
      <div>
        <div className="eyebrow">Jeres svar</div>
        <div style={{ height: 16 }} />
        {field("fejl1", "Fejl 1", "Hvad er forkert, og hvad er det rigtige?")}
        {field("fejl2", "Fejl 2", "")}
        {field("fejl3", "Fejl 3", "")}
        {field("tjek", "Sådan tjekkede vi", "Hvilke kilder brugte I?")}
        <div className="savebar">
          <button className="btn accent" onClick={submit} disabled={!open || !loaded || state === "saving"}>{submittedAt ? "Aflever igen" : "Aflever"}</button>
          {submittedAt ? <span className="status-pill ok">Afleveret kl. {fmtTime(submittedAt)}</span> : <span className="status-pill">Ikke afleveret</span>}
          <span className="muted" style={{ fontSize: 13 }}>{state === "saving" ? "Gemmer" : state === "saved" ? "Kladde gemt" : ""}</span>
        </div>
        {msg && <p className="error">{msg}</p>}
      </div>
    </section>
  );
}
