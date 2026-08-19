import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents clickjacking — sites kunnen niet in een iframe worden geladen
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stopt MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stuurt Referer alleen bij gelijke origin mee
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Schakelt overbodige browser-features uit
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Laat browser alleen via HTTPS verbinding maken (na eerste bezoek)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy — laat bekende bronnen toe, blokkeert inline scripts
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Afbeeldingen: alles is toegestaan (user content vanuit willekeurige CDNs)
      "img-src * data: blob:",
      // Scripts: alleen eigen origin + Next.js dev-tools in development
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Stijlen: eigen origin + inline (nodig voor Tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Formulieren mogen alleen naar eigen origin posten
      "form-action 'self'",
      // Frames: eigen origin + YouTube/Vimeo voor embed-blok
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
      // Media (audio/video): eigen origin + bekende media-CDNs
      "media-src 'self' blob:",
      // Verbindt alleen met eigen backend + Supabase + Neon
      "connect-src 'self' https://*.supabase.co https://*.neon.tech wss://*.supabase.co",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
