import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./MangaCard.module.css";

interface MangaCardProps {
  id: string;
  title: string;
  coverUrl: string;
  rating?: string;
  tags?: string[];
}

const MangaCard = React.memo(function MangaCard({ id, title, coverUrl, rating, tags }: MangaCardProps) {
  return (
    <Link href={`/manga/${id}`} className={styles.card}>
      <div className={styles.cardImage}>
        <Image src={coverUrl} alt={title} fill sizes="(max-width: 768px) 50vw, 200px" style={{ objectFit: "cover" }} unoptimized />
        <div className={styles.cardOverlay}>
          {rating && <span className={`badge ${rating === "safe" ? "badge-success" : "badge-warning"}`}>{rating}</span>}
        </div>
      </div>
      <div className={styles.cardInfo}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {tags && tags.length > 0 && (
          <div className={styles.cardTags}>
            {tags.slice(0, 2).map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
});

export default MangaCard;
