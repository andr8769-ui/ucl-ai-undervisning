import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: "120px 24px" }}>
      <div className="eyebrow">Ikke fundet</div>
      <h1 style={{ fontSize: 48, margin: "12px 0 24px" }}>Siden findes ikke.</h1>
      <Link className="btn" href="/">Til forsiden</Link>
    </main>
  );
}
