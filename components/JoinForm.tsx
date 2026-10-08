"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/hold/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, username }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Noget gik galt. Prøv igen.");
    router.push("/hold");
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>Holdkode</span>
        <input className="input codeinput" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} autoComplete="off" autoCapitalize="characters" placeholder="ABC12" required />
      </label>
      <label className="field">
        <span>Brugernavn</span>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} autoComplete="nickname" placeholder="Fx dit fornavn" required />
      </label>
      <p className="muted" style={{ fontSize: 13, marginTop: -6 }}>Brug dit fornavn eller et kaldenavn. Ikke dit fulde navn.</p>
      <button className="btn" type="submit" disabled={busy} style={{ width: "100%", marginTop: 8 }}>{busy ? "Et øjeblik" : "Deltag"}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
