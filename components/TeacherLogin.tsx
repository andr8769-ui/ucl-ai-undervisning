"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherLogin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/laerer/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error || "Forkert lærerkode.");
    router.refresh();
  }

  return (
    <>
      <div className="topbar"><div className="wrap"><Link href="/" className="brand">UCL Vejle · AI</Link></div></div>
      <main className="wrap">
        <section className="hero">
          <div>
            <div className="eyebrow">Underviser</div>
            <h1 style={{ marginTop: 18 }}>Klar til <span className="accent">timen.</span></h1>
            <p className="lead">Opret et hold, del koden, og følg afleveringer og spørgsmål live.</p>
          </div>
          <div className="panel">
            <h2>Log ind</h2>
            <form onSubmit={submit}>
              <label className="field">
                <span>Lærerkode</span>
                <input className="input" type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="current-password" required autoFocus />
              </label>
              <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>{busy ? "Et øjeblik" : "Log ind"}</button>
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
