"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui";
import { Home, ChevronLeft, ChevronRight, Eye, EyeOff, ArrowUp, BookOpen, RefreshCw } from "lucide-react";
import styles from "./Read.module.css";

const MangaPageImage = ({ src, index, chapterId }: { src: string, index: number, chapterId: string }) => {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = () => {
    setError(true);
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    
    try {
      // Fetch a new node from our API
      const res = await fetch(`/api/read/node/${chapterId}`);
      const data = await res.json();
      
      if (data.baseUrl) {
        // Extract the /data/hash/file part from the current URL
        const parts = currentSrc.split('/data/');
        if (parts.length === 2) {
          const newSrc = `${data.baseUrl}/data/${parts[1]}`;
          setCurrentSrc(newSrc);
          setError(false);
          setIsRetrying(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to get new node:", err);
    }
    
    // Fallback if API fails or parsing fails
    setError(false);
    setRetryCount(prev => prev + 1);
    setIsRetrying(false);
  };

  // Add retry cache buster as fallback
  const imageSrc = retryCount > 0 ? `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}retry=${retryCount}` : currentSrc;

  return (
    <div className={styles.pageWrapper}>
      {error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', width: '100%' }}>
          <p style={{ marginBottom: '1rem' }}>Failed to load page {index + 1}</p>
          <button onClick={handleRetry} className="btn-secondary" disabled={isRetrying} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isRetrying ? 0.7 : 1 }}>
            <RefreshCw size={16} className={isRetrying ? "spin" : ""} /> {isRetrying ? "Fetching new node..." : "Try Again"}
          </button>
        </div>
      ) : (
        <img 
          src={imageSrc} 
          alt={`Page ${index + 1}`} 
          loading={index < 3 ? "eager" : "lazy"} 
          onContextMenu={(e) => e.preventDefault()} 
          onError={handleError}
        />
      )}
    </div>
  );
};

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
          <MangaPageImage key={i} src={src} index={i} chapterId={chapterId} />
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
