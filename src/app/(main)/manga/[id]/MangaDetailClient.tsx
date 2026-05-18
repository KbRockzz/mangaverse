"use client";
import Link from "next/link";
import Image from "next/image";
import { User, Info, List as ListIcon, Play } from "lucide-react";
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

export default function MangaDetailClient({ title, description, coverUrl, author, status, contentRating, tags, chapters }: Props) {
  const chapterList = chapters as Chapter[];

  return (
    <div className={`${styles.detailsPage} fade-in`}>
      <div className={styles.heroBg} style={{ backgroundImage: `url(${coverUrl})` }} />
      <div className="container">
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.cover}>
              <Image src={coverUrl} alt={title} width={300} height={450} style={{ objectFit: "cover", width: "100%", height: "auto" }} unoptimized priority />
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
