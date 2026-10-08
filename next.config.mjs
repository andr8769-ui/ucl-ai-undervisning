/** @type {import('next').NextConfig} */

// Next matcher nøglerne som delstrenge af ruten, og excludes vinder over includes.
// Nøglerne er derfor valgt, så hver kun rammer de ruter, der læser fra private/.
const SLIDES = "./private/*/slides/**";
const NOTES = "./private/*/notes.json";
const FILES = ["./private/*/praesentation.pptx", "./private/undervisningsplan.pdf"];

const nextConfig = {
  outputFileTracingIncludes: {
    "/api/laerer/slide/**": [SLIDES],
    "/api/laerer/noter/**": [NOTES],
    "/api/laerer/fil/**": FILES,
    "/laerer/*/praesenter": [NOTES],
    "/laerer/*/taler": [NOTES],
  },
  // Filsporingen tager ellers hele private/ med i alle ruter, der læser derfra.
  outputFileTracingExcludes: {
    "/api/laerer/slide/**": [NOTES, ...FILES],
    "/api/laerer/noter/**": [SLIDES, ...FILES],
    "/api/laerer/fil/**": [SLIDES, NOTES],
    "/laerer/*/praesenter": [SLIDES, ...FILES],
    "/laerer/*/taler": [SLIDES, ...FILES],
  },
  poweredByHeader: false,
};

export default nextConfig;
