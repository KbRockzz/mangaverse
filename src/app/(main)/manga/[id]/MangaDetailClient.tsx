"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, Info, List as ListIcon, Play, Bookmark, BookmarkCheck } from "lucide-react";
import { formatDate } from "@/utils/helpers";
import styles from "./MangaDetail.module.css";

interface Chapter {
  id: string;
  attributes: { chapter: string | null; title: string | null; createdAt: string };
}

interface Props {
  id: string; title: string; description: string; coverUrl: string;
  author: string; status: string; contentRating: string;
  tags: string[]; chapters: unknown[];
}

export default function MangaDetailClient({ id, title, description, coverUrl, author, status, contentRating, tags, chapters }: Props) {
  const chapterList = chapters as Chapter[];
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/bookmarks/check?mangaId=${id}`)
        .then(res => res.json())
        .then(data => {
          setIsBookmarked(data.bookmarked);
          setIsChecking(false);
        })
        .catch(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, [id, session]);

  const toggleBookmark = async () => {
    if (!session?.user) {
      alert("Please login to bookmark mangas.");
      return;
    }

    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mangaId: id,
          title,
          description,
          coverUrl,
          author,
          tags
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(data.bookmarked);
      } else {
        setIsBookmarked(previousState);
        alert(data.message || "Failed to toggle bookmark");
      }
    } catch (e) {
      setIsBookmarked(previousState);
      alert("Failed to toggle bookmark");
    }
  };

  return (
    <div className={`${styles.detailsPage} fade-in`}>
      <div className={styles.heroBg}>
        <img src={coverUrl} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.cover}>
              <Image src={coverUrl} alt={title} width={300} height={450} style={{ objectFit: "cover", width: "100%", height: "auto" }} unoptimized priority referrerPolicy="no-referrer" />
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={`badge ${status === "completed" ? "badge-success" : "badge-info"}`}>{status}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Rating</span>
                <span className={`badge ${contentRating === "safe" ? "badge-success" : "badge-warning"}`}>{contentRating}</span>
              </div>
            </div>
          </div>

          <div className={styles.main}>
            <h1 className={styles.mangaTitle}>{title}</h1>
            <div className={styles.authorInfo}><User size={16} /><span>{author}</span></div>

            <div className={styles.tagsContainer}>
              {tags.map((tag) => <span key={tag} className={styles.tagPill}>{tag}</span>)}
            </div>

            <div className={styles.actions}>
              {chapterList.length > 0 && (
                <Link href={`/read/${chapterList[chapterList.length - 1].id}`} className="btn-primary">
                  <Play size={18} /> Read First Chapter
                </Link>
              )}
              <button 
                className={`btn-secondary ${isBookmarked ? 'active' : ''}`} 
                onClick={toggleBookmark}
                disabled={isChecking}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isBookmarked ? 'var(--primary-dark)' : 'var(--bg-secondary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: isChecking ? 'not-allowed' : 'pointer' }}
              >
                {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>

            <div className={styles.descSection}>
              <h2 className={styles.sectionTitle}><Info size={20} /> Synopsis</h2>
              <p className={styles.descText}>{description}</p>
            </div>

            <div className={styles.chaptersSection}>
              <h2 className={styles.sectionTitle}><ListIcon size={20} /> Chapters ({chapterList.length})</h2>
              <div className={styles.chapterList}>
                {chapterList.map((chapter) => (
                  <Link key={chapter.id} href={`/read/${chapter.id}`} className={styles.chapterItem}>
                    <div className={styles.chapterInfo}>
                      <span className={styles.chapterNumber}>Chapter {chapter.attributes.chapter || "?"}</span>
                      <span className={styles.chapterTitle}>{chapter.attributes.title || "No Title"}</span>
                    </div>
                    <div className={styles.chapterDate}>{formatDate(chapter.attributes.createdAt)}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
