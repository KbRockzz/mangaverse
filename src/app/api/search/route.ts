import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://api.mangadex.org";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const tags = searchParams.get("tags") || "";
    const status = searchParams.get("status") || "";
    const rating = searchParams.get("rating") || "";
    const order = searchParams.get("order") || "followedCount";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const params: Record<string, any> = {
      limit,
      offset,
      "includes[]": ["cover_art", "author", "artist"],
      "contentRating[]": rating ? [rating] : ["safe", "suggestive"],
    };

    // Add search query if present
    if (q.trim()) {
      params.title = q.trim();
    }

    // Add tag filters if present
    if (tags.trim()) {
      const tagIds = tags.split(",").filter(Boolean);
      if (tagIds.length > 0) {
        params["includedTags[]"] = tagIds;
      }
    }

    // Add publication status filter if present
    if (status.trim()) {
      params["status[]"] = [status];
    }

    // Add sorting options
    if (order === "followedCount") params["order[followedCount]"] = "desc";
    else if (order === "createdAt") params["order[createdAt]"] = "desc";
    else if (order === "rating") params["order[rating]"] = "desc";
    else params["order[relevance]"] = "desc";

    const response = await axios.get(`${BASE_URL}/manga`, { params });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error inside server-side search API route:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch search results from MangaDex" },
      { status: 500 }
    );
  }
}
