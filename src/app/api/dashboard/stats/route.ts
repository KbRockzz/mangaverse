import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const [totalManga, totalChapters, totalUsers, totalBookmarks] = await Promise.all([
    prisma.manga.count(),
    prisma.chapter.count(),
    prisma.user.count(),
    prisma.bookmark.count(),
  ]);

  // Manga by status
  const allManga = await prisma.manga.findMany({ select: { status: true } });
  const statusMap: Record<string, number> = {};
  allManga.forEach((m) => { statusMap[m.status] = (statusMap[m.status] || 0) + 1; });
  const mangaByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Recent manga
  const recentManga = await prisma.manga.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });

  // Monthly manga (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentAll = await prisma.manga.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });
  const monthlyMap: Record<string, number> = {};
  recentAll.forEach((m) => {
    const key = m.createdAt.toISOString().slice(0, 7);
    monthlyMap[key] = (monthlyMap[key] || 0) + 1;
  });
  const monthlyManga = Object.entries(monthlyMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return NextResponse.json({
    success: true,
    data: { totalManga, totalChapters, totalUsers, totalBookmarks, mangaByStatus, recentManga, monthlyManga },
  });
}
