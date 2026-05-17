import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const targets = [
      "billing",
      "billing/success",
      "devices",
      "single-message",
      "templates",
      "contacts",
      "bulk-messages",
      "auto-reply",
      "chatbot",
      "call-responder",
      "live-chat",
      "group-grabber",
      "profile",
    ] as const;

    return [
      ...targets.map((path) => ({
        source: `/${path}`,
        destination: `/user/dashboard/${path}`,
        permanent: true,
      })),
      {
        source: "/contacts/:path*",
        destination: "/user/dashboard/contacts/:path*",
        permanent: true,
      },
      {
        source: "/bulk-messages/:path*",
        destination: "/user/dashboard/bulk-messages/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
