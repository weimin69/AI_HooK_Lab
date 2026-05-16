import type { NextConfig } from "next";

/*
 * Content Security Policy
 *
 * Why some 'unsafe-*' are unavoidable in Next.js:
 * - 'unsafe-inline' on script-src: Next.js injects inline <script> tags for
 *   client-side hydration, chunk loading, and Fast Refresh (dev mode). Without
 *   this, the app breaks entirely. Mitigation: we never use dangerouslySetInnerHTML.
 * - 'unsafe-inline' on style-src: Tailwind CSS v4 uses CSS-in-JS at build time;
 *   in dev mode, styles are injected inline. Required for rendering.
 * - 'unsafe-eval' on script-src: needed for Next.js dev mode (Hot Module
 *   Replacement uses eval internally). Can be removed in production if you
 *   confirm it's not needed, but Next.js does not guarantee eval-free production
 *   builds at this time.
 *
 * For a stricter CSP in production, you would need:
 *   1. Next.js with 'strict-dynamic' + nonce (complex config)
 *   2. Or a static export with no runtime JS (not applicable here)
 *
 * Current config is the strongest CSP that's compatible with Next.js + Tailwind.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",         // API calls go through server-side proxy; browser only talks to own origin
  "frame-ancestors 'none'",     // prevent clickjacking
  "base-uri 'self'",            // prevent base tag hijacking
  "form-action 'self'",         // prevent form redirection
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // --- Prevent content injection & XSS ---
          { key: "Content-Security-Policy", value: csp },

          // --- Prevent MIME-type sniffing ---
          { key: "X-Content-Type-Options", value: "nosniff" },

          // --- Prevent clickjacking ---
          { key: "X-Frame-Options", value: "DENY" },

          // --- Control referrer leakage ---
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // --- Force HTTPS (Vercel does this by default; explicit for self-hosted) ---
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },

          // --- Disable unnecessary browser features ---
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
