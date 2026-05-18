import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/manga/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manga = await prisma.manga.findUnique({
    where: { id },
    include: { chapters: { orderBy: { number: "asc" } }, _count: { select: { bookmarks: true } } },
  });
  if (!manga) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: manga });
}

// PUT /api/manga/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const manga = await prisma.manga.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        coverImage: body.coverImage,
        author: body.author,
        status: body.status,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
      },
    });
    return NextResponse.json({ success: true, data: manga });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/manga/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.manga.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
