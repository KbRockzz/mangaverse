"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import MangaGrid from "@/components/manga/MangaGrid";
import { Pagination } from "@/components/ui";
import { Search as SearchIcon, X, Tag } from "lucide-react";
import styles from "./Search.module.css";

// Popular genres/tags with their correct MangaDex UUIDs
const POPULAR_TAGS = [
  { id: "391b0423-d847-456f-aff0-8b0cfc03066b", name: "Action" },
  { id: "87cc87cd-a395-47af-b27a-93258283bbc6", name: "Adventure" },
  { id: "4d32cc48-9f00-4cca-9b5a-a839f0764984", name: "Comedy" },
  { id: "b9af3a63-f058-46de-a9a0-e0c13906197a", name: "Drama" },
  { id: "cdc58593-87dd-415e-bbc0-2ec27bf404cc", name: "Fantasy" },
  { id: "cdad7e68-1419-41dd-bdce-27753074a640", name: "Horror" },
  { id: "ee968100-4191-4968-93d3-f82d72be7e46", name: "Mystery" },
  { id: "423e2eae-a7a2-4a8b-ac03-a8351462d71d", name: "Romance" },
  { id: "256c8bd9-4904-4360-bf4f-508a76d67183", name: "Sci-Fi" },
  { id: "caaa44eb-cd40-4177-b930-79d3ef2afe87", name: "School Life" },
  { id: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9", name: "Slice of Life" },
  { id: "69964a64-2f90-4d33-beeb-f3ed2875eb4c", name: "Sports" },
  { id: "eabc5b4c-6aff-42f3-b657-3e90cbd00b75", name: "Supernatural" },
  { id: "07251805-a27e-4d59-b488-f0bfbec15168", name: "Thriller" },
  { id: "ace04997-f6bd-436e-b261-779182193d3d", name: "Isekai" },
  { id: "33771934-028e-4cb3-8744-691e866a923e", name: "Historical" },
  { id: "3b60b75c-a2d7-4860-ab56-05f391bb889c", name: "Psychological" }
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialOrder = searchParams.get("order") || "followedCount";

  const [query, setQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [order, setOrder] = useState(initialOrder);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  // Sync state if initial query or order parameters change (from Navbar links)
  useEffect(() => {
    setQuery(initialQuery);
    setOrder(initialOrder);
    setPage(1);
  }, [initialQuery, initialOrder]);

  // Query search results through our secure local proxy route (prevents CORS blocks)
  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery, selectedTags, statusFilter, ratingFilter, order, page],
    queryFn: async () => {
      const tagQuery = selectedTags.join(",");
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&tags=${tagQuery}&status=${statusFilter}&rating=${ratingFilter}&order=${order}&page=${page}`
      );
      if (!res.ok) throw new Error("Failed to load search results");
      return res.json();
    },
  });

  const mangaList = data?.data || [];
  const total = data?.total || 0;

  // Toggle tag selection
  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
    setPage(1);
  };

  // Reset all filters
  const handleClearAll = () => {
    setQuery("");
    setSelectedTags([]);
    setStatusFilter("");
    setRatingFilter("");
    setOrder("followedCount");
    setPage(1);
  };

  return (
    <div className={`${styles.searchPage} container fade-in`}>
      {/* HEADER SECTION */}
      <div className={styles.searchHeader}>
        <h1>
          {debouncedQuery || selectedTags.length > 0 ? (
            <>
              Results for{" "}
              <span className="gradient-text">
                {debouncedQuery ? `"${debouncedQuery}"` : "Selected Categories"}
              </span>
            </>
          ) : (
            <span className="gradient-text">Browse & Explore Manga</span>
          )}
        </h1>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder="Search manga by title..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="form-input"
          />
        </div>

        {/* Sort Order Selector */}
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setPage(1);
          }}
          className="form-input"
          style={{ maxWidth: 180 }}
        >
          <option value="followedCount">Trending</option>
          <option value="createdAt">Latest Releases</option>
          <option value="rating">Top Rated</option>
        </select>

        {/* Status Selector */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="form-input"
          style={{ maxWidth: 180 }}
        >
          <option value="">All Statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
        </select>

        {/* Content Rating Selector */}
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setPage(1);
          }}
          className="form-input"
          style={{ maxWidth: 180 }}
        >
          <option value="">All Ratings</option>
          <option value="safe">Safe Only</option>
          <option value="suggestive">Suggestive</option>
        </select>
      </div>

      {/* CATEGORIES SECTION */}
      <div className={styles.tagSection}>
        <div className={styles.tagSectionTitle}>
          <span>
            <Tag size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />{" "}
            Filter by Category / Tag
          </span>
          {(selectedTags.length > 0 || query || statusFilter || ratingFilter || order !== "followedCount") && (
            <button onClick={handleClearAll} className={styles.clearAllBtn}>
              Clear All Filters
            </button>
          )}
        </div>
        <div className={styles.tagGrid}>
          {POPULAR_TAGS.map((tag) => {
            const isActive = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className={`${styles.tagBadge} ${isActive ? styles.tagBadgeActive : ""}`}
              >
                {tag.name}
                {isActive && <X size={12} style={{ marginLeft: "0.25rem" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTS LISTING */}
      <div className={styles.resultsMeta}>
        <span>{total} manga found</span>
        {selectedTags.length > 0 && (
          <span>({selectedTags.length} categories active)</span>
        )}
      </div>

      <MangaGrid mangaList={mangaList} loading={isLoading} />

      {/* PAGINATION */}
      {total > 20 && (
        <div style={{ marginTop: "2rem" }}>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / 20)}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading search console...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
