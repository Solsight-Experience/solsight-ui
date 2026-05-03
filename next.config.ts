import type { NextConfig } from "next";

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
                hostname: "coin-images.coingecko.com",
                port: "",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                port: "",
                pathname: "/**"
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:3000/api/:path*"
            }
        ];
    }
};

export default nextConfig;
