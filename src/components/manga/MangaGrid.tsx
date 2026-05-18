"use client";
import React, { useMemo } from "react";
import MangaCard from "./MangaCard";
import { getCoverUrl } from "@/lib/mangadex";
import type { MangaDexManga } from "@/types";
import styles from "./MangaGrid.module.css";

interface MangaGridProps {
  title?: string;
  mangaList: MangaDexManga[];
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function MangaGrid({ mangaList, title, loading, icon }: MangaGridProps) {
  const cards = useMemo(
    () =>
      mangaList.map((manga) => {
        const t = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0] || "Untitled";
        const cover = manga.relationships.find((r) => r.type === "cover_art");
        const fileName = cover?.attributes?.fileName as string | undefined;
        const coverUrl = (manga.attributes as any).coverUrl || getCoverUrl(manga.id, fileName);
        const tags = manga.attributes.tags?.slice(0, 2).map((tag) => tag.attributes.name.en) || [];
        const rating = manga.attributes.contentRating;
        return { id: manga.id, title: t, coverUrl, tags, rating };
      }),
    [mangaList]
  );

  if (loading) {
    return (
      <section className={styles.section}>
        {title && <h2 className={styles.gridTitle}>{icon} {title}</h2>}
        <div className={styles.grid}>
          {[...Array(10)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.gridTitle}>{icon} {title}</h2>}
      <div className={styles.grid}>
        {cards.map((c) => (
          <MangaCard key={c.id} {...c} />
        ))}
      </div>
    </section>
  );
}
