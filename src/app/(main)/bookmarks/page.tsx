import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import MangaCard from "@/components/manga/MangaCard";
import styles from "@/components/manga/MangaGrid.module.css";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookmarks | Mangaverse",
  description: "View your bookmarked mangas",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      manga: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container fade-in" style={{ padding: "2rem 0", minHeight: "80vh" }}>
      <section className={styles.section}>
        <h1 className={styles.gridTitle} style={{ fontSize: "2rem", marginBottom: "2rem" }}>
          <BookmarkIcon size={32} /> My Bookmarks
        </h1>
        
        {bookmarks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
            <p>You haven't bookmarked any mangas yet.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {bookmarks.map(({ manga }) => (
              <MangaCard
                key={manga.id}
                id={manga.id}
                title={manga.title}
                coverUrl={manga.coverImage || "/images/placeholder-cover.jpg"}
                rating={manga.status} // Since DB has 'status' and no separate rating easily mapped
                tags={manga.tags ? JSON.parse(manga.tags) : []}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
