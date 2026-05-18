import { NextResponse } from "next/server";
import { fetchChapterImages, fetchChapterDetails, fetchMangaDetails, fetchChapterList } from "@/lib/mangadex";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    
    // 1. Fetch chapter image page URLs
    const urls = await fetchChapterImages(chapterId);

    // 2. Fetch chapter details to identify parent mangaId
    const details = await fetchChapterDetails(chapterId);
    const mangaRel = details.relationships.find((r: any) => r.type === "manga");
    const mangaId = mangaRel ? mangaRel.id : null;
    const currentChapterNumber = parseFloat(details.attributes.chapter) || 0;
    const currentChapterTitle = details.attributes.title || `Chapter ${details.attributes.chapter}`;

    let mangaTitle = "Manga Details";
    let chaptersList: any[] = [];
    let prevChapterId: string | null = null;
    let nextChapterId: string | null = null;

    if (mangaId) {
      try {
        // Fetch manga info
        const mangaData = await fetchMangaDetails(mangaId);
        mangaTitle = mangaData.attributes.title.en || 
                     mangaData.attributes.title[Object.keys(mangaData.attributes.title)[0]] || 
                     "Manga Details";

        // Fetch other chapters
        const feedResponse = await fetchChapterList(mangaId, 0, 100);
        const feedData = feedResponse.data || [];

        // Map, clean, and filter chapters to ensure unique and sorted lists
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
          // Sort chronologically (lowest chapter number first)
          .sort((a: any, b: any) => a.number - b.number);

        // Find next and previous chapters
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
        console.error("Error fetching related manga details/chapters server-side:", err);
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
