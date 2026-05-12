import { createSerwistRoute } from "@serwist/turbopack";
import type { NextRequest } from "next/server";

// dynamic and dynamicParams must be static literals for Turbopack to parse them.
// Values match what createSerwistRoute returns internally.
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

const handler = createSerwistRoute({
  swSrc: "app/sw.ts",
});

// createSerwistRoute's generateStaticParams returns { path: string } (joined),
// but Next.js [...path] catch-all requires { path: string[] }.
export async function generateStaticParams() {
  const entries = await handler.generateStaticParams();
  return entries.map(({ path }) => ({ path: path.split("/") }));
}

// Cast params to satisfy Next.js's [...path] catch-all typing.
// createSerwistRoute internally works with the path joined as a string.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handler.GET(req, {
    params: Promise.resolve({ path: path.join("/") }),
  });
}
