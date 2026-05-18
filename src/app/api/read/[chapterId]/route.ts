import { NextResponse } from "next/server";
import { fetchChapterImages } from "@/lib/mangadex";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const urls = await fetchChapterImages(chapterId);
    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error fetching chapter images server-side:", error);
    return NextResponse.json({ error: "Failed to fetch chapter images" }, { status: 500 });
  }
}
