import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "encrypted-tbn0.gstatic.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "i.pravatar.cc",
                port: "",
                pathname: "/**"
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${API_ORIGIN}/api/:path*`
            }
        ];
    }
};

export default nextConfig;
