import { createSerwistRoute } from "@serwist/turbopack";
import type { NextRequest } from "next/server";

const handler = createSerwistRoute({
  swSrc: "app/sw.ts",
});

export const dynamic = handler.dynamic;
export const dynamicParams = handler.dynamicParams;
export const revalidate = handler.revalidate;
export const generateStaticParams = handler.generateStaticParams;

// Cast params to satisfy Next.js's [...path] catch-all typing.
// createSerwistRoute internally joins the path array into a string.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handler.GET(req, {
    params: Promise.resolve({ path: path.join("/") }),
  });
}
