"use client";
import { useState } from "react";

export default function AskWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setState("sending"); setError("");
    const res = await fetch("/api/hold/spoergsmaal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setState("idle"); setError(d.error || "Spørgsmålet blev ikke sendt."); return; }
    setText(""); setState("sent");
  }

  return (
    <>
      {open && (
        <div className="ask-panel">
          <div className="eyebrow">Stil et spørgsmål</div>
          <p className="muted" style={{ fontSize: 14, margin: "6px 0 14px" }}>Det dukker op på skærmen, mens der bliver præsenteret.</p>
          <form onSubmit={send}>
            <textarea className="textarea" value={text} onChange={(e) => { setText(e.target.value); setState("idle"); }} maxLength={500} placeholder="Skriv dit spørgsmål" autoFocus />
            <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
              <button className="btn accent" type="submit" disabled={state === "sending" || !text.trim()}>{state === "sending" ? "Sender" : "Send"}</button>
              <button className="btn ghost" type="button" onClick={() => setOpen(false)}>Luk</button>
              {state === "sent" && <span className="status-pill ok">Sendt</span>}
            </div>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      )}
      <button className="btn accent ask-fab" onClick={() => setOpen(!open)}>{open ? "Skjul" : "Stil et spørgsmål"}</button>
    </>
  );
}
