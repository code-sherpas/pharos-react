// Minimal Next.js config for the RSC consumer harness. Nothing app-specific —
// the whole point is to consume the published Pharos artifact (built `dist/`
// with per-file `"use client"` directives) exactly like a real Next.js App
// Router consumer, so `next build` exercises the RSC server/client boundaries.
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
