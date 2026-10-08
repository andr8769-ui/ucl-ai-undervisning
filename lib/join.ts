import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

export async function joinInfo(code: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const url = `${base}/?kode=${code}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
  return { base, url, host, qrSvg };
}
