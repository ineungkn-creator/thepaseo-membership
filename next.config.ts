/** @type {import('next').NextConfig} */
const nextConfig = {
  // ปิด turbopack — บังคับใช้ Webpack
  experimental: {
    turbo: false,
  },

  distDir: ".next",

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
      },
      {
        protocol: "https",
        hostname: "member.thepaseo.co.th",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

