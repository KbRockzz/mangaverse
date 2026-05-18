"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchManga, fetchMangaList } from "@/lib/mangadex";
import { useDebounce } from "@/hooks/useDebounce";
import MangaGrid from "@/components/manga/MangaGrid";
import { Pagination } from "@/components/ui";
import { Search as SearchIcon } from "lucide-react";
import styles from "./Search.module.css";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialOrder = searchParams.get("order") || "";

  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery, initialOrder, statusFilter, ratingFilter, page],
    queryFn: async () => {
      if (debouncedQuery) {
        return searchManga(debouncedQuery, 20);
      }
      return fetchMangaList(initialOrder || "followedCount", 20, (page - 1) * 20);
    },
  });

  const mangaList = data?.data || [];
  const total = data?.total || 0;

  // Filter client-side for status and rating
  const filteredList = mangaList.filter((m: { attributes: { status: string; contentRating: string } }) => {
    if (statusFilter && m.attributes.status !== statusFilter) return false;
    if (ratingFilter && m.attributes.contentRating !== ratingFilter) return false;
    return true;
  });

  return (
    <div className={`${styles.searchPage} container fade-in`}>
      <div className={styles.searchHeader}>
        <h1>
          {debouncedQuery ? (
            <>Results for <span className="gradient-text">&quot;{debouncedQuery}&quot;</span></>
          ) : (
            <span className="gradient-text">Browse Manga</span>
          )}
        </h1>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <SearchIcon size={18} />
          <input
            type="text" placeholder="Search manga..." value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="form-input"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ maxWidth: 180 }}>
          <option value="">All Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
        </select>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="form-input" style={{ maxWidth: 180 }}>
          <option value="">All Ratings</option>
          <option value="safe">Safe</option>
          <option value="suggestive">Suggestive</option>
        </select>
      </div>

      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{filteredList.length} manga found</p>

      <MangaGrid mangaList={filteredList} loading={isLoading} />

      {!debouncedQuery && (
        <Pagination currentPage={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />
      )}
    </div>
  );
}
