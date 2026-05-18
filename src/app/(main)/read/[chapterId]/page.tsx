"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui";
import { Home, ChevronLeft, ChevronRight, Eye, EyeOff, ArrowUp, BookOpen } from "lucide-react";
import styles from "./Read.module.css";

export default function ReadPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  // Chapter navigation and context states
  const [mangaId, setMangaId] = useState<string | null>(null);
  const [mangaTitle, setMangaTitle] = useState("Manga");
  const [chapters, setChapters] = useState<any[]>([]);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/read/${chapterId}`);
        const data = await res.json();
        if (data.urls) {
          setImages(data.urls);
          setMangaId(data.mangaId);
          setMangaTitle(data.mangaTitle);
          setChapters(data.chapters || []);
          setPrevChapterId(data.prevChapterId);
          setNextChapterId(data.nextChapterId);
        } else {
          throw new Error(data.error || "Failed to load pages");
        }
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

  const toggleControls = () => setShowControls(!showControls);

  return (
    <div 
      className={`${styles.readPage} ${!showControls ? styles.hideControls : ""}`}
      onClick={(e) => {
        // Toggle interface controls if user clicks on background margins or the reader images
        const target = e.target as HTMLElement;
        if (
          target.tagName === "IMG" || 
          target.classList.contains(styles.pageWrapper) || 
          target.classList.contains(styles.readerContent)
        ) {
          toggleControls();
        }
      }}
    >
      {/* HEADER NAVBAR */}
      <div className={`${styles.readerHeader} glass`}>
        <div className={`${styles.readerNav} container`}>
          <div className={styles.navLeft}>
            <Link href="/" className={styles.navItem} title="Home"><Home size={20} /></Link>
            {mangaId && (
              <Link href={`/manga/${mangaId}`} className={styles.backToMangaBtn} title="Back to Manga Details">
                <ChevronLeft size={16} />
                <span className={styles.mangaTitleText}>{mangaTitle}</span>
              </Link>
            )}
          </div>
          
          <div className={styles.navCenter}>
            {chapters.length > 0 && (
              <div className={styles.selectorWrapper}>
                <BookOpen size={16} className={styles.selectorIcon} />
                <select 
                  className={styles.chapterSelect}
                  value={chapterId}
                  onChange={(e) => {
                    window.location.href = `/read/${e.target.value}`;
                  }}
                >
                  {chapters.map((ch: any) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.navRight}>
            <button 
              className={styles.navItem} 
              onClick={toggleControls} 
              title={showControls ? "Hide interface controls (Fullscreen)" : "Show interface controls"}
            >
              {showControls ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* MANGA PAGES */}
      <div className={styles.readerContent}>
        {images.map((src, i) => (
          <div key={i} className={styles.pageWrapper}>
            <img src={src} alt={`Page ${i + 1}`} loading={i < 3 ? "eager" : "lazy"} onContextMenu={(e) => e.preventDefault()} />
          </div>
        ))}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className={`${styles.readerFooter} glass`}>
        <div className={`container ${styles.footerNav}`}>
          <button 
            className="btn-secondary" 
            disabled={!prevChapterId}
            onClick={() => {
              if (prevChapterId) window.location.href = `/read/${prevChapterId}`;
            }}
          >
            <ChevronLeft /> Previous
          </button>
          <button 
            className="btn-primary" 
            disabled={!nextChapterId}
            onClick={() => {
              if (nextChapterId) window.location.href = `/read/${nextChapterId}`;
            }}
          >
            Next <ChevronRight />
          </button>
        </div>
      </div>

      {/* SCROLL TO TOP */}
      <button className={styles.scrollTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUp size={24} />
      </button>

      {/* FLOATING CONTROL TOGGLE FOR FULLSCREEN MODE */}
      {!showControls && (
        <button 
          className={styles.floatingToggle} 
          onClick={toggleControls}
          title="Show interface controls"
        >
          <Eye size={20} />
        </button>
      )}
    </div>
  );
}
