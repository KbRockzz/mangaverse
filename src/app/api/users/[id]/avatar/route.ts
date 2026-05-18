import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { avatar: true },
    });

    if (!user || !user.avatar) {
      return new NextResponse("Not found", { status: 404 });
    }

    const matches = user.avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      if (user.avatar.startsWith('http') || user.avatar.startsWith('/')) {
        return NextResponse.redirect(new URL(user.avatar, req.url));
      }
      return new NextResponse("Invalid avatar format", { status: 400 });
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
