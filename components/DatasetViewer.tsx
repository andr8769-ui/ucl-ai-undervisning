"use client";
import { useEffect, useMemo, useState } from "react";
import type { Programme } from "@/lib/programmes";

type Sheet = { name: string; readme?: string[]; columns?: string[]; rows?: (string | number | null)[][] };
const PAGE = 100;

const fmt = (v: string | number | null, col = "") => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") {
    if (/rabat/i.test(col)) return (v * 100).toLocaleString("da-DK", { maximumFractionDigits: 1 }) + " %";
    return v.toLocaleString("da-DK", { maximumFractionDigits: 3 });
  }
  return v;
};

export default function DatasetViewer({ prog }: { prog: Programme }) {
  const [sheets, setSheets] = useState<Sheet[] | null>(null);
  const [active, setActive] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch(`/p/${prog.key}/dataset.json`).then((r) => r.json()).then((d) => setSheets(d.sheets)).catch(() => setSheets([]));
  }, [prog.key]);

  const sheet = sheets?.[active];
  const filtered = useMemo(() => {
    if (!sheet?.rows) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return sheet.rows;
    return sheet.rows.filter((r) => r.some((c, j) => String(fmt(c, sheet.columns?.[j])).toLowerCase().includes(needle)));
  }, [sheet, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice(page * PAGE, page * PAGE + PAGE);

  if (!sheets) return <p className="muted">Henter datasættet</p>;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div className="eyebrow">Datasæt · alle data er fiktive</div>
          <h2 style={{ fontSize: 28, marginTop: 8 }}>{prog.datasetName}</h2>
        </div>
        <a className="btn small" href={`/p/${prog.key}/filer/${prog.datasetFile}`} download>Hent Excel-filen</a>
      </div>
      <div className="sheettabs">
        {sheets.map((s, i) => (
          <button key={s.name} className="chip" aria-pressed={i === active} onClick={() => { setActive(i); setPage(0); setQ(""); }}>{s.name}</button>
        ))}
      </div>
      {sheet?.readme ? (
        <div className="quote" style={{ fontSize: 16 }}>{sheet.readme.map((l, i) => <p key={i} style={{ margin: i ? "10px 0 0" : 0, fontWeight: i === 0 ? 700 : 400 }}>{l}</p>)}</div>
      ) : sheet ? (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <input className="input" style={{ maxWidth: 320 }} placeholder="Søg i fanen" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
            <span className="muted" style={{ fontSize: 14 }}>{filtered.length.toLocaleString("da-DK")} rækker</span>
          </div>
          <div className="tablewrap">
            <table className="data">
              <thead><tr>{sheet.columns!.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {view.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j} className={typeof c === "number" ? "num" : typeof c === "string" && c.length > 60 ? "wrap" : ""}>{fmt(c, sheet.columns![j])}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="pager">
              <button className="btn ghost small" disabled={page === 0} onClick={() => setPage(page - 1)}>Forrige</button>
              <span className="muted" style={{ fontSize: 14 }}>Række {(page * PAGE + 1).toLocaleString("da-DK")} til {Math.min(filtered.length, (page + 1) * PAGE).toLocaleString("da-DK")}</span>
              <button className="btn ghost small" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Næste</button>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
