/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/laerer/**": ["./private/**/*"],
    "/laerer/**": ["./private/*/notes.json"],
  },
  poweredByHeader: false,
};

export default nextConfig;
