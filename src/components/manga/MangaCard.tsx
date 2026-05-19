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
  const getRatingClass = (r?: string) => {
    if (!r) return "";
    switch (r.toLowerCase()) {
      case "safe":
        return styles.ratingSafe;
      case "suggestive":
        return styles.ratingSuggestive;
      case "erotica":
      case "pornographic":
        return styles.ratingErotica;
      default:
        return "";
    }
  };

  return (
    <Link href={`/manga/${id}`} className={styles.card}>
      <div className={styles.cardImage}>
        <Image src={coverUrl} alt={title} fill sizes="(max-width: 768px) 50vw, 200px" style={{ objectFit: "cover" }} unoptimized referrerPolicy="no-referrer" />
        {rating && (
          <span className={`${styles.ratingBadge} ${getRatingClass(rating)}`}>
            {rating}
          </span>
        )}
        <div className={styles.cardOverlay} />
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
