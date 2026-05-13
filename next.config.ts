import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  turbopack: {},
};

const withMDX = createMDX();
export default withSerwist(withMDX(nextConfig));
