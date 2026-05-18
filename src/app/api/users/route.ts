import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users - admin only
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
  if (role) where.role = role;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, updatedAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ success: true, data, total, page, limit });
}
