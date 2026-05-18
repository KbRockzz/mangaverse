import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ bookmarked: false });
    }

    const { searchParams } = new URL(req.url);
    const mangaId = searchParams.get("mangaId");

    if (!mangaId) {
      return NextResponse.json({ message: "Manga ID is required" }, { status: 400 });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId,
        },
      },
    });

    return NextResponse.json({ bookmarked: !!existingBookmark });
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
