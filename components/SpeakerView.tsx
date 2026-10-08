"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { channel, fetchQuestions, Overlay, PresMsg, Question, readSlide, setQuestionStatus, slideUrl } from "./presenterSync";

const t = (iso: string) => new Date(iso).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");

export default function SpeakerView({ sessionId, progKey, progName, className, count }: { sessionId: string; progKey: string; progName: string; className: string; count: number }) {
  const [n, setN] = useState(1);
  const [notes, setNotes] = useState<string[]>([]);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [anon, setAnon] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [linked, setLinked] = useState(false);
  const bc = useRef<BroadcastChannel | null>(null);
  const nRef = useRef(1);

  useEffect(() => {
    const start = readSlide(sessionId, count);
    nRef.current = start; setN(start);
    fetch(`/api/laerer/noter/${progKey}`).then((r) => r.json()).then((d) => setNotes(d.notes || [])).catch(() => {});
    bc.current = channel(sessionId);
    if (bc.current) {
      bc.current.onmessage = (e: MessageEvent<PresMsg>) => {
        const m = e.data;
        if (m.type === "state") { nRef.current = m.n; setN(m.n); setOverlay(m.overlay); setAnon(m.anon); setLinked(true); }
      };
      bc.current.postMessage({ type: "hello" } satisfies PresMsg);
    }
    return () => bc.current?.close();
  }, [sessionId, count, progKey]);

  const go = useCallback((next: number) => {
    const v = Math.min(count, Math.max(1, next));
    nRef.current = v; setN(v);
    bc.current?.postMessage({ type: "goto", n: v } satisfies PresMsg);
  }, [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(nRef.current + 1); }
      else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(nRef.current - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    let alive = true;
    const tick = async () => { const qs = await fetchQuestions(sessionId); if (alive && qs) setQuestions(qs); };
    tick();
    const iv = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, [sessionId]);

  const sendOverlay = (o: Overlay) => { setOverlay(o); bc.current?.postMessage({ type: "overlay", overlay: o } satisfies PresMsg); };
  const sendAnon = (a: boolean) => { setAnon(a); bc.current?.postMessage({ type: "anon", anon: a } satisfies PresMsg); };
  const done = async (id: string) => { await setQuestionStatus(id, "done"); setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, status: "done" } : q))); };

  const open = questions.filter((q) => q.status !== "done").reverse();

  return (
    <div className="speaker">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div className="eyebrow" style={{ color: "#a1a1a6" }}><span className="dot" />{progName} · {className}</div>
          <div className="muted" style={{ fontSize: 14 }}>{linked ? "Forbundet til præsentationen" : "Åbn Præsentér i et andet vindue"}</div>
        </div>
        <div className="current">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slideUrl(progKey, n)} alt="" />
        </div>
        <div className="ctrls">
          <button className="btn ghost" onClick={() => go(n - 1)} disabled={n <= 1}>Forrige</button>
          <button className="btn accent" onClick={() => go(n + 1)} disabled={n >= count}>Næste</button>
          <button className="btn ghost" onClick={() => sendOverlay(overlay === "code" ? "none" : "code")}>{overlay === "code" ? "Skjul holdkode" : "Vis holdkode"}</button>
          <button className="btn ghost" onClick={() => sendOverlay(overlay === "questions" ? "none" : "questions")}>{overlay === "questions" ? "Skjul spørgsmål" : "Vis spørgsmål på skærmen"}</button>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#a1a1a6", fontSize: 14 }}>
            <input type="checkbox" checked={anon} onChange={(e) => sendAnon(e.target.checked)} /> Anonyme pop-ups
          </label>
        </div>
        <div className="next">
          <div>
            <div className="eyebrow" style={{ color: "#a1a1a6", marginBottom: 6 }}>Næste</div>
            {n < count ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slideUrl(progKey, n + 1)} alt="" />
            ) : <div className="muted">Sidste slide</div>}
          </div>
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ color: "#a1a1a6", marginBottom: 10 }}>Talernoter</div>
        <div className="notes">{notes[n - 1] || "Ingen noter til denne slide."}</div>
        <div className="qs">
          <div className="eyebrow" style={{ color: "#a1a1a6", margin: "22px 0 4px" }}>Spørgsmål {open.length > 0 && <span className="badge">{open.length}</span>}</div>
          {open.length === 0 ? <p className="muted">Ingen åbne spørgsmål.</p> : open.map((q) => (
            <div className="qrow" key={q.id}>
              <div>
                <div className="eyebrow" style={{ color: "#a1a1a6" }}>{q.username} · {t(q.created_at)}</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{q.body}</div>
              </div>
              <button className="btn ghost small" onClick={() => done(q.id)}>Besvaret</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
