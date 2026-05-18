import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchChapterImages, fetchChapterDetails, fetchMangaDetails, fetchChapterList } from "@/lib/mangadex";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    
    // 1. Try to find the chapter in our local PostgreSQL database first
    const localChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { manga: true }
    });

    let urls: string[] = [];
    let mangaId: string | null = null;
    let mangaTitle = "Manga Details";
    let currentChapterNumber = 0;
    let currentChapterTitle = "";
    let chaptersList: any[] = [];
    let prevChapterId: string | null = null;
    let nextChapterId: string | null = null;

    if (localChapter) {
      // 2. Local Database Chapter
      mangaId = localChapter.mangaId;
      mangaTitle = localChapter.manga.title;
      currentChapterNumber = localChapter.number;
      currentChapterTitle = localChapter.title || `Chapter ${localChapter.number}`;

      // Check if it has custom pages (image URLs)
      if (localChapter.pages && localChapter.pages.length > 0) {
        urls = localChapter.pages;
      } else if (localChapter.mangadexChapterId) {
        // Fallback to MangaDex if it has a linked MangaDex ID
        try {
          urls = await fetchChapterImages(localChapter.mangadexChapterId);
        } catch (err) {
          console.error("Failed to fetch MangaDex pages for local chapter fallback:", err);
        }
      }

      // Fetch other chapters of this manga from the local database
      const localChapters = await prisma.chapter.findMany({
        where: { mangaId },
        orderBy: { number: "asc" }
      });

      chaptersList = localChapters.map((ch: any) => ({
        id: ch.id,
        number: ch.number,
        title: ch.title ? `Ch. ${ch.number} - ${ch.title}` : `Chapter ${ch.number}`,
      }));

      // Calculate next and prev links locally
      const currentIndex = localChapters.findIndex((ch) => ch.id === chapterId);
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          prevChapterId = localChapters[currentIndex - 1].id;
        }
        if (currentIndex < localChapters.length - 1) {
          nextChapterId = localChapters[currentIndex + 1].id;
        }
      }
    } else {
      // 3. Fallback to MangaDex Chapter
      urls = await fetchChapterImages(chapterId);
      const details = await fetchChapterDetails(chapterId);
      const mangaRel = details.relationships.find((r: any) => r.type === "manga");
      mangaId = mangaRel ? mangaRel.id : null;
      currentChapterNumber = parseFloat(details.attributes.chapter) || 0;
      currentChapterTitle = details.attributes.title || `Chapter ${details.attributes.chapter}`;

      if (mangaId) {
        try {
          const mangaData = await fetchMangaDetails(mangaId);
          mangaTitle = mangaData.attributes.title.en || 
                       mangaData.attributes.title[Object.keys(mangaData.attributes.title)[0]] || 
                       "Manga Details";

          const feedResponse = await fetchChapterList(mangaId, 0, 100);
          const feedData = feedResponse.data || [];

          const seenChapters = new Set<string>();
          chaptersList = feedData
            .map((c: any) => ({
              id: c.id,
              number: parseFloat(c.attributes.chapter) || 0,
              title: c.attributes.title ? `Ch. ${c.attributes.chapter} - ${c.attributes.title}` : `Chapter ${c.attributes.chapter}`,
            }))
            .filter((c: any) => {
              const key = `${c.number}`;
              if (seenChapters.has(key)) return false;
              seenChapters.add(key);
              return true;
            })
            .sort((a: any, b: any) => a.number - b.number);

          const currentIndex = chaptersList.findIndex((ch: any) => ch.id === chapterId);
          if (currentIndex !== -1) {
            if (currentIndex > 0) {
              prevChapterId = chaptersList[currentIndex - 1].id;
            }
            if (currentIndex < chaptersList.length - 1) {
              nextChapterId = chaptersList[currentIndex + 1].id;
            }
          }
        } catch (err) {
          console.error("Error fetching related MangaDex details:", err);
        }
      }
    }

    return NextResponse.json({
      urls,
      mangaId,
      mangaTitle,
      currentChapterNumber,
      currentChapterTitle,
      chapters: chaptersList,
      prevChapterId,
      nextChapterId,
    });
  } catch (error) {
    console.error("Error fetching chapter images server-side:", error);
    return NextResponse.json({ error: "Failed to fetch chapter images" }, { status: 500 });
  }
}
