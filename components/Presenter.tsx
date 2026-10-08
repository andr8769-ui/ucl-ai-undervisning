"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { channel, fetchQuestions, Overlay, PresMsg, Question, readSlide, setQuestionStatus, slideUrl, writeSlide } from "./presenterSync";

type Toast = Question & { key: number };

export default function Presenter({ sessionId, progKey, count, code, host, qrSvg }: { sessionId: string; progKey: string; count: number; code: string; host: string; qrSvg: string }) {
  const [n, setN] = useState(1);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [anon, setAnon] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cursor, setCursor] = useState(true);
  const [hint, setHint] = useState(true);
  const seen = useRef<Set<string>>(new Set());
  const bc = useRef<BroadcastChannel | null>(null);
  const state = useRef({ n: 1, overlay: "none" as Overlay, anon: false });

  const broadcast = useCallback(() => {
    bc.current?.postMessage({ type: "state", ...state.current } satisfies PresMsg);
  }, []);

  const go = useCallback((next: number) => {
    const v = Math.min(count, Math.max(1, next));
    state.current.n = v;
    setN(v);
    writeSlide(sessionId, v);
    broadcast();
  }, [count, sessionId, broadcast]);

  const setOv = useCallback((o: Overlay) => {
    state.current.overlay = o;
    setOverlay(o);
    broadcast();
  }, [broadcast]);

  // initial state + channel
  useEffect(() => {
    const start = readSlide(sessionId, count);
    state.current.n = start;
    setN(start);
    try { const a = localStorage.getItem(`anon-${sessionId}`) === "1"; state.current.anon = a; setAnon(a); } catch {}
    bc.current = channel(sessionId);
    if (bc.current) bc.current.onmessage = (e: MessageEvent<PresMsg>) => {
      const m = e.data;
      if (m.type === "goto") go(m.n);
      else if (m.type === "hello") broadcast();
      else if (m.type === "overlay") setOv(m.overlay);
      else if (m.type === "anon") { state.current.anon = m.anon; setAnon(m.anon); try { localStorage.setItem(`anon-${sessionId}`, m.anon ? "1" : "0"); } catch {} broadcast(); }
    };
    broadcast();
    const h = setTimeout(() => setHint(false), 5000);
    return () => { bc.current?.close(); clearTimeout(h); };
  }, [sessionId, count, go, setOv, broadcast]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); go(state.current.n + 1); }
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); go(state.current.n - 1); }
      else if (k === "Home") go(1);
      else if (k === "End") go(count);
      else if (k === "k" || k === "K") setOv(state.current.overlay === "code" ? "none" : "code");
      else if (k === "q" || k === "Q") setOv(state.current.overlay === "questions" ? "none" : "questions");
      else if (k === "Escape") { setOv("none"); setToasts([]); }
      else if (k === "f" || k === "F") { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, count, setOv]);

  // hide cursor when idle
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const move = () => { setCursor(true); clearTimeout(t); t = setTimeout(() => setCursor(false), 2000); };
    window.addEventListener("mousemove", move);
    move();
    return () => { window.removeEventListener("mousemove", move); clearTimeout(t); };
  }, []);

  // questions polling and pop-ups
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const qs = await fetchQuestions(sessionId);
      if (!alive || !qs) return;
      setQuestions(qs);
      const fresh = qs.filter((q) => q.status === "new" && !seen.current.has(q.id));
      for (const q of fresh) {
        seen.current.add(q.id);
        const key = Date.now() + Math.random();
        setToasts((ts) => [...ts.slice(-2), { ...q, key }]);
        setTimeout(() => setToasts((ts) => ts.filter((x) => x.key !== key)), 25000);
        setQuestionStatus(q.id, "shown");
      }
    };
    tick();
    const iv = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, [sessionId]);

  // preload neighbours
  useEffect(() => {
    [n + 1, n + 2, n - 1].filter((x) => x >= 1 && x <= count).forEach((x) => { const i = new Image(); i.src = slideUrl(progKey, x); });
  }, [n, count, progKey]);

  const click = (e: React.MouseEvent) => {
    if (overlay !== "none") return setOv("none");
    go(e.clientX > window.innerWidth / 3 ? state.current.n + 1 : state.current.n - 1);
  };
  const openQs = questions.filter((q) => q.status !== "done");

  return (
    <div className={`stage ${cursor ? "cursor" : ""}`} onClick={click}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="slide" src={slideUrl(progKey, n)} alt="" draggable={false} />

      <div className="toasts" onClick={(e) => e.stopPropagation()}>
        {toasts.map((t) => (
          <div className="toast" key={t.key} onClick={() => setToasts((ts) => ts.filter((x) => x.key !== t.key))}>
            <div className="who">{anon ? "Spørgsmål" : `Spørgsmål fra ${t.username}`}</div>
            <div className="txt">{t.body}</div>
          </div>
        ))}
      </div>

      {overlay === "code" && (
        <div className="overlay">
          <div className="joincard">
            <div>
              <div style={{ fontSize: "1.6vw", color: "#a1a1a6", fontWeight: 600 }}>Gå ind på {host}</div>
              <div className="bigcode" style={{ marginTop: "2vh" }}>{code}</div>
            </div>
            <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>
        </div>
      )}
      {overlay === "questions" && (
        <div className="overlay">
          <div className="qlist">
            <div style={{ fontSize: "1.1vw", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "2vh" }}>Jeres spørgsmål</div>
            {openQs.length === 0 ? <div className="q" style={{ color: "#a1a1a6" }}>Ingen åbne spørgsmål.</div> : openQs.map((q) => (
              <div className="q" key={q.id}>{!anon && <span style={{ color: "#a1a1a6", fontWeight: 500 }}>{q.username}  </span>}{q.body}</div>
            ))}
          </div>
        </div>
      )}
      <div className="hint" style={{ opacity: hint ? 1 : 0 }}>Piletaster bladrer · F fuld skærm · K holdkode · Q spørgsmål</div>
    </div>
  );
}
