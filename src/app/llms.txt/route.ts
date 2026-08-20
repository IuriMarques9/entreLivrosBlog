import { createPublicClient } from "@/lib/supabase/public";
import { withRetry } from "@/lib/retry";
import { bookHref } from "@/lib/bookSlug";
import { SITE_URL } from "@/lib/site";

// llms.txt (llmstxt.org) — cheap bet for AI crawlers, not a ranking lever.
// Generated from the same data source as the sitemap so it never diverges.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  // Throw on failure (supabase-js never throws on its own — it returns
  // { data: null, error }) so a bad revalidation keeps serving the last good
  // ISR snapshot instead of caching an empty skeleton for an hour.
  const { books, posts } = await withRetry(async () => {
    const supabase = createPublicClient();
    const [bookRes, postRes] = await Promise.all([
      supabase
        .from("BookReview")
        .select("id, title, author")
        .order("reviewDate", { ascending: false }),
      supabase
        .from("posts")
        .select("slug, title")
        .eq("published", true)
        .order("publishedAt", { ascending: false }),
    ]);
    if (bookRes.error) throw bookRes.error;
    if (postRes.error) throw postRes.error;
    return {
      books: (bookRes.data ?? []) as { id: number; title: string; author: string }[],
      posts: (postRes.data ?? []) as { slug: string; title: string }[],
    };
  });

  const lines = [
    "# Entre Livros",
    "",
    "> Site de recomendações literárias de Tatiana Felício. Avaliações honestas de livros (classificação de 1 a 5), em português de Portugal.",
    "",
    "## Factos",
    "- Autora: Tatiana Felício",
    "- Idioma: português (pt-PT)",
    "- Conteúdo: avaliações de livros com classificação, sinopse e recomendação; publicações da autora sobre leitura",
    ...(books.length > 0 ? [`- Livros avaliados: ${books.length}`] : []),
    "",
    "## Páginas",
    `- [Início](${SITE_URL}): todas as avaliações de livros, filtráveis por género`,
    `- [Publicações](${SITE_URL}/posts): textos da autora`,
    `- [Sobre a autora](${SITE_URL}/aboutMe): quem é a Tatiana Felício`,
  ];

  if (books.length > 0) {
    lines.push("", "## Avaliações de livros");
    for (const b of books) {
      lines.push(`- [${b.title} — ${b.author}](${SITE_URL}${bookHref(b)})`);
    }
  }

  if (posts.length > 0) {
    lines.push("", "## Publicações");
    for (const p of posts) {
      lines.push(`- [${p.title}](${SITE_URL}/posts/${p.slug})`);
    }
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
