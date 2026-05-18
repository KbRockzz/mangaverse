import { Metadata } from "next";
import { fetchMangaDetails, fetchChapterList, getCoverUrl } from "@/lib/mangadex";
import MangaDetailClient from "./MangaDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const manga = await fetchMangaDetails(id);
    const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "Manga";
    const desc = manga.attributes.description?.en || "";
    return {
      title,
      description: desc.slice(0, 160),
      openGraph: { title, description: desc.slice(0, 160), type: "article" },
    };
  } catch {
    return { title: "Manga Details" };
  }
}

// SSR - dynamic rendering
export const dynamic = "force-dynamic";

export default async function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let manga = null;
  let chapters: unknown[] = [];

  try {
    const [mangaData, chaptersData] = await Promise.all([
      fetchMangaDetails(id),
      fetchChapterList(id),
    ]);
    manga = mangaData;
    chapters = chaptersData.data || [];
  } catch (error) {
    console.error("Error fetching manga:", error);
  }

  if (!manga) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h1>Manga not found</h1>
        <p style={{ color: "var(--text-secondary)" }}>The manga you are looking for does not exist.</p>
      </div>
    );
  }

  const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0];
  const description = manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || "";
  const coverArt = manga.relationships.find((r: { type: string }) => r.type === "cover_art");
  const coverUrl = getCoverUrl(id, coverArt?.attributes?.fileName as string);
  const author = manga.relationships.find((r: { type: string }) => r.type === "author")?.attributes?.name as string || "Unknown";
  const tags = manga.attributes.tags.map((t: { attributes: { name: { en: string } } }) => t.attributes.name.en);

  return (
    <MangaDetailClient
      id={id}
      title={title}
      description={description}
      coverUrl={coverUrl}
      author={author}
      status={manga.attributes.status}
      contentRating={manga.attributes.contentRating}
      tags={tags}
      chapters={chapters}
    />
  );
}
