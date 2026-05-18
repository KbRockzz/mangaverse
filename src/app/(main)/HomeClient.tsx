"use client";
import Link from "next/link";
import { TrendingUp, Clock } from "lucide-react";
import MangaGrid from "@/components/manga/MangaGrid";
import type { MangaDexManga } from "@/types";
import styles from "./Home.module.css";

export default function HomeClient({ trending, latest }: { trending: MangaDexManga[]; latest: MangaDexManga[] }) {
  return (
    <div className={`${styles.homePage} container fade-in`}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className="gradient-text">Unleash Your Imagination</h1>
          <p>Explore thousands of manga, manhwa, and manhua from all over the world.</p>
          <div className={styles.heroActions}>
            <Link href="/search?order=followedCount" className="btn-primary">Start Reading</Link>
            <Link href="/search?order=rating" className="btn-secondary">Popular Today</Link>
          </div>
        </div>
      </header>

      <MangaGrid title="Popular Right Now" mangaList={trending} icon={<TrendingUp />} />
      <MangaGrid title="Recently Added" mangaList={latest} icon={<Clock />} />
    </div>
  );
}
