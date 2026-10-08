import Link from "next/link";
import JoinForm from "@/components/JoinForm";

export default async function Home({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const { kode } = await searchParams;
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span className="brand">UCL Vejle · AI</span>
          <Link href="/laerer" className="btn ghost small">Underviser</Link>
        </div>
      </div>
      <main className="wrap">
        <section className="hero">
          <div>
            <div className="eyebrow">Tænk selv. Brug AI.</div>
            <h1 style={{ marginTop: 18 }}>Velkommen til timen.</h1>
            <p className="lead">Skriv holdkoden fra tavlen og et brugernavn. Så er du med.</p>
          </div>
          <div className="panel">
            <h2>Deltag</h2>
            <JoinForm initialCode={(kode || "").toUpperCase().slice(0, 8)} />
          </div>
        </section>
      </main>
    </>
  );
}
