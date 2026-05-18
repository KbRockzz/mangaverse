import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        manga: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mangaId, title, description, coverUrl, author, tags } = body;

    if (!mangaId) {
      return NextResponse.json({ message: "Manga ID is required" }, { status: 400 });
    }

    // 1. Check if manga exists in local DB
    let localManga = await prisma.manga.findUnique({
      where: { id: mangaId },
    });

    // 2. If it doesn't exist, create it using the metadata from MangaDex
    if (!localManga) {
      localManga = await prisma.manga.create({
        data: {
          id: mangaId,
          mangadexId: mangaId, // Save as mangadexId too just in case
          title: title || "Unknown Title",
          description: description || "",
          coverImage: coverUrl || "",
          author: author || "Unknown",
          tags: tags ? JSON.stringify(tags) : "[]",
          status: "ongoing", // default
        },
      });
    }

    // 3. Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId,
        },
      },
    });

    if (existingBookmark) {
      // Unbookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return NextResponse.json({ bookmarked: false, message: "Bookmark removed" });
    } else {
      // Bookmark
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          mangaId,
        },
      });
      return NextResponse.json({ bookmarked: true, message: "Bookmark added" });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
