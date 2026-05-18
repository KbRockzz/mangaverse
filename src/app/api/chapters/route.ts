import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/chapters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mangaId = searchParams.get("mangaId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (mangaId) where.mangaId = mangaId;

  const [data, total] = await Promise.all([
    prisma.chapter.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { number: "desc" },
      include: { manga: { select: { title: true } } },
    }),
    prisma.chapter.count({ where }),
  ]);

  return NextResponse.json({ success: true, data, total, page, limit });
}

// POST /api/chapters
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const chapter = await prisma.chapter.create({
      data: {
        number: body.number,
        title: body.title || null,
        mangaId: body.mangaId,
        mangadexChapterId: body.mangadexChapterId || null,
        pages: body.pages || [],
      },
    });
    return NextResponse.json({ success: true, data: chapter }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
