import { docsSource } from "@/lib/docs-source";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = docsSource.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} className="relative">
      {/* Branded Ambient Background Glows */}
      <div className="absolute -top-20 left-10 w-72 h-72 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-72 h-72 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto py-2">
        <div className="mb-6 border-b border-zinc-800/80 pb-6">
          <DocsTitle className="text-3xl font-black text-white tracking-tight">{page.data.title}</DocsTitle>
          {page.data.description && (
            <DocsDescription className="text-zinc-450 text-sm mt-2 leading-relaxed">
              {page.data.description}
            </DocsDescription>
          )}
        </div>
        <DocsBody className="text-zinc-300">
          <MDX components={{ ...defaultMdxComponents }} />
        </DocsBody>
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = docsSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
