import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/manga - List manga with search, filter, pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";

  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.manga.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: "desc" },
      include: { _count: { select: { chapters: true, bookmarks: true } } },
    }),
    prisma.manga.count({ where }),
  ]);

  return NextResponse.json({ success: true, data, total, page, limit });
}

// POST /api/manga - Create manga (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const manga = await prisma.manga.create({
      data: {
        title: body.title,
        description: body.description || null,
        coverImage: body.coverImage || null,
        author: body.author || null,
        status: body.status || "ongoing",
        tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : (body.tags || null),
        mangadexId: body.mangadexId || null,
      },
    });
    return NextResponse.json({ success: true, data: manga }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
