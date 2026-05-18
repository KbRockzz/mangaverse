"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchChapterImages } from "@/lib/mangadex";
import { LoadingScreen } from "@/components/ui";
import { Home, ChevronLeft, ChevronRight, Settings, ArrowUp } from "lucide-react";
import styles from "./Read.module.css";

export default function ReadPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const urls = await fetchChapterImages(chapterId);
        setImages(urls);
      } catch (err) {
        console.error("Error loading chapter:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [chapterId]);

  if (loading) return <LoadingScreen message="Preparing pages..." />;

  return (
    <div className={`${styles.readPage} ${!showControls ? styles.hideControls : ""}`}>
      <div className={`${styles.readerHeader} glass`}>
        <div className={`${styles.readerNav} container`}>
          <Link href="/" className={styles.navItem}><Home size={20} /></Link>
          <span>Reading Chapter</span>
          <button className={styles.navItem} onClick={() => setShowControls(!showControls)}>
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className={styles.readerContent}>
        {images.map((src, i) => (
          <div key={i} className={styles.pageWrapper}>
            <img src={src} alt={`Page ${i + 1}`} loading={i < 3 ? "eager" : "lazy"} onContextMenu={(e) => e.preventDefault()} referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>

      <div className={`${styles.readerFooter} glass`}>
        <div className={`container ${styles.footerNav}`}>
          <button className="btn-secondary"><ChevronLeft /> Previous</button>
          <button className="btn-primary">Next <ChevronRight /></button>
        </div>
      </div>

      <button className={styles.scrollTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
