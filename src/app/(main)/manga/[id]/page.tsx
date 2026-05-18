import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { fetchMangaDetails, fetchChapterList, getCoverUrl } from "@/lib/mangadex";
import MangaDetailClient from "./MangaDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    // Check local database first
    const localManga = await prisma.manga.findUnique({ where: { id } });
    if (localManga) {
      return {
        title: localManga.title,
        description: localManga.description?.slice(0, 160) || "",
        openGraph: {
          title: localManga.title,
          description: localManga.description?.slice(0, 160) || "",
          type: "article",
        },
      };
    }

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
  let title = "";
  let description = "";
  let coverUrl = "";
  let author = "Unknown";
  let status = "ongoing";
  let contentRating = "safe";
  let tags: string[] = [];
  let chapters: any[] = [];
  let found = false;

  // 1. Try to find the manga in our local PostgreSQL database first
  try {
    const localManga = await prisma.manga.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { number: "asc" }
        }
      }
    });

    if (localManga) {
      title = localManga.title;
      description = localManga.description || "";
      coverUrl = localManga.coverImage || "/images/placeholder-cover.jpg";
      author = localManga.author || "Unknown";
      status = localManga.status || "ongoing";
      contentRating = "safe";
      tags = localManga.tags ? JSON.parse(localManga.tags) : [];
      
      if (localManga.mangadexId) {
        try {
          const chaptersData = await fetchChapterList(localManga.mangadexId);
          chapters = chaptersData.data || [];
        } catch (error) {
          console.error("Error fetching chapters from MangaDex for local manga:", error);
        }
      } else {
        chapters = (localManga.chapters || []).map((ch: any) => ({
          id: ch.id,
          attributes: {
            chapter: `${ch.number}`,
            title: ch.title,
            createdAt: ch.createdAt.toISOString()
          }
        }));
      }
      found = true;
    }
  } catch (error) {
    console.error("Error looking up local manga:", error);
  }

  // 2. Fall back to MangaDex API if not found in local database
  if (!found) {
    try {
      const [mangaData, chaptersData] = await Promise.all([
        fetchMangaDetails(id),
        fetchChapterList(id),
      ]);

      if (mangaData) {
        title = mangaData.attributes.title.en || mangaData.attributes.title.ja || Object.values(mangaData.attributes.title)[0] || "Manga";
        description = mangaData.attributes.description?.en || Object.values(mangaData.attributes.description || {})[0] || "";
        
        const coverArt = mangaData.relationships.find((r: { type: string }) => r.type === "cover_art");
        coverUrl = getCoverUrl(id, coverArt?.attributes?.fileName as string);
        
        author = mangaData.relationships.find((r: { type: string }) => r.type === "author")?.attributes?.name as string || "Unknown";
        status = mangaData.attributes.status;
        contentRating = mangaData.attributes.contentRating;
        tags = mangaData.attributes.tags.map((t: { attributes: { name: { en: string } } }) => t.attributes.name.en);
        
        chapters = chaptersData.data || [];
        found = true;
      }
    } catch (error) {
      console.error("Error fetching manga from MangaDex:", error);
    }
  }

  if (!found) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h1>Manga not found</h1>
        <p style={{ color: "var(--text-secondary)" }}>The manga you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <MangaDetailClient
      id={id}
      title={title}
      description={description}
      coverUrl={coverUrl}
      author={author}
      status={status}
      contentRating={contentRating}
      tags={tags}
      chapters={chapters}
    />
  );
}
