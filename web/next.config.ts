import type { NextConfig } from "next";

// Deployed as a proxied sub-path of www.outdoorswithkaran.com (see Outdoorswithkaran
// repo vercel.json rewrites). NEXT_PUBLIC_BASE_PATH must match that path so Next's
// router, <Link>, <Image>, and _next/* assets all resolve correctly through the proxy.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
};

export default nextConfig;
