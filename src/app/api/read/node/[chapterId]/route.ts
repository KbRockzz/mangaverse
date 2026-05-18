import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    return NextResponse.json({ baseUrl: response.data.baseUrl });
  } catch (error) {
    console.error("Error refreshing MangaDex node:", error);
    return NextResponse.json({ error: "Failed to fetch new node" }, { status: 500 });
  }
}
