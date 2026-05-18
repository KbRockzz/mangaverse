"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { Pagination, Modal, LoadingScreen, EmptyState, Spinner } from "@/components/ui";
import { formatDate } from "@/utils/helpers";
import type { DBChapter, DBManga } from "@/types";

const chapterSchema = z.object({
  mangaId: z.string().min(1, "Manga is required"),
  number: z.coerce.number().min(0, "Chapter number required"),
  title: z.string().optional(),
  mangadexChapterId: z.string().optional(),
});
type ChapterForm = z.infer<typeof chapterSchema>;

export default function AdminChaptersPage() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [mangaFilter, setMangaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DBChapter | null>(null);
  const [editing, setEditing] = useState<DBChapter | null>(null);

  // Custom pages management states
  const [pages, setPages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChapterForm>({
    resolver: zodResolver(chapterSchema) as any,
    defaultValues: { number: 1 },
  });

  const { data: mangaData } = useQuery({
    queryKey: ["manga-list-select"],
    queryFn: () => fetch("/api/manga?limit=100").then((r) => r.json()),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chapters", mangaFilter, page],
    queryFn: () => fetch(`/api/chapters?mangaId=${mangaFilter}&page=${page}&limit=15`).then((r) => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ChapterForm) => {
      const url = editing ? `/api/chapters/${editing.id}` : "/api/chapters";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, pages }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        addToast("success", editing ? "Chapter updated!" : "Chapter created!");
        qc.invalidateQueries({ queryKey: ["admin-chapters"] });
        setModalOpen(false);
        reset();
        setEditing(null);
        setPages([]);
      } else {
        addToast("error", data.error || "Failed");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/chapters/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      addToast("success", "Chapter deleted");
      qc.invalidateQueries({ queryKey: ["admin-chapters"] });
      setDeleteModal(null);
    },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setPages([]);
    reset({ number: 1, title: "", mangaId: mangaFilter || "", mangadexChapterId: "" });
    setModalOpen(true);
  }, [reset, mangaFilter]);

  const openEdit = useCallback((ch: DBChapter) => {
    setEditing(ch);
    setPages(ch.pages || []);
    reset({ number: ch.number, title: ch.title || "", mangaId: ch.mangaId, mangadexChapterId: ch.mangadexChapterId || "" });
    setModalOpen(true);
  }, [reset]);

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setPages((prev) => [...prev, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          newUrls.push(data.data.url);
        } else {
          addToast("error", `Failed to upload: ${data.error}`);
        }
      }

      if (newUrls.length > 0) {
        setPages((prev) => [...prev, ...newUrls]);
        addToast("success", `Uploaded ${newUrls.length} pages successfully!`);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const movePage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === pages.length - 1) return;

    const newPages = [...pages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPages(newPages);
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const chapters: DBChapter[] = data?.data || [];
  const total = data?.total || 0;
  const allManga: DBManga[] = mangaData?.data || [];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Chapter Management</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={18} /> Add Chapter</button>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <select value={mangaFilter} onChange={(e) => { setMangaFilter(e.target.value); setPage(1); }} className="form-input" style={{ maxWidth: 300 }}>
          <option value="">All Manga</option>
          {allManga.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingScreen /> : chapters.length === 0 ? (
        <EmptyState title="No chapters found" message="Add chapters or select a manga above." />
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Manga</th><th>Chapter</th><th>Title</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {chapters.map((ch) => (
                  <tr key={ch.id}>
                    <td style={{ color: "var(--text-secondary)", maxWidth: 160 }}>{ch.manga?.title || "—"}</td>
                    <td style={{ fontWeight: 600 }}>Ch. {ch.number}</td>
                    <td>{ch.title || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{formatDate(ch.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(ch)}><Edit size={14} /></button>
                        <button className="btn-danger btn-sm" onClick={() => setDeleteModal(ch)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / 15)} onPageChange={setPage} />
        </>
      )}

      {/* ADD/EDIT CHAPTER MODAL */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Edit Chapter" : "Add Chapter"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit((v) => saveMutation.mutate(v as any))} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Spinner size="sm" /> : editing ? "Save" : "Create"}
            </button>
          </>
        }>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Manga *</label>
            <select {...register("mangaId")} className={`form-input ${errors.mangaId ? "error" : ""}`}>
              <option value="">Select manga...</option>
              {allManga.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            {errors.mangaId && <p className="form-error">{errors.mangaId.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Chapter Number *</label>
            <input {...register("number")} type="number" step="0.1" className={`form-input ${errors.number ? "error" : ""}`} />
            {errors.number && <p className="form-error">{errors.number.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input {...register("title")} className="form-input" placeholder="Optional title" />
          </div>
          <div className="form-group">
            <label className="form-label">MangaDex Chapter ID (Optional Fallback)</label>
            <input {...register("mangadexChapterId")} className="form-input" placeholder="Optional MangaDex ID" />
          </div>

          {/* CUSTOM IMAGE PAGES MANAGER */}
          <div className="form-group" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ margin: 0 }}>Chapter Pages / Images ({pages.length})</label>
              {pages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPages([])}
                  style={{ fontSize: "0.75rem", textDecoration: "underline", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Drag & Drop File Upload */}
            <div style={{
              border: "2px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              padding: "1.25rem",
              textAlign: "center",
              marginBottom: "1rem",
              background: "rgba(255, 255, 255, 0.02)",
              position: "relative",
              cursor: "pointer"
            }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                disabled={uploading}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {uploading ? <Spinner size="sm" /> : "Drag & drop or Click to upload local pages (multiple allowed)"}
              </span>
            </div>

            {/* Direct URL paste */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Or paste external image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="btn-secondary"
                style={{ whiteSpace: "nowrap" }}
              >
                Add URL
              </button>
            </div>

            {/* List of Pages */}
            {pages.length > 0 ? (
              <div style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.1)"
              }}>
                {pages.map((p, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    borderBottom: idx < pages.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none"
                  }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: "bold", minWidth: "1.5rem" }}>
                      #{idx + 1}
                    </span>
                    <div style={{
                      width: "36px",
                      height: "48px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      background: "rgba(255, 255, 255, 0.05)",
                      flexShrink: 0
                    }}>
                      <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                    </div>
                    <span style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}>
                      {p}
                    </span>
                    <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => movePage(idx, "up")}
                        disabled={idx === 0}
                        style={{ padding: "0.25rem 0.4rem", background: "rgba(255, 255, 255, 0.05)", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(idx, "down")}
                        disabled={idx === pages.length - 1}
                        style={{ padding: "0.25rem 0.4rem", background: "rgba(255, 255, 255, 0.05)", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removePage(idx)}
                        style={{ padding: "0.25rem 0.4rem", background: "rgba(255, 74, 96, 0.1)", border: "none", borderRadius: "4px", color: "var(--accent-color)", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center", margin: "1rem 0" }}>
                No custom pages uploaded yet.
              </p>
            )}
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Chapter"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => deleteModal && deleteMutation.mutate(deleteModal.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Spinner size="sm" /> : "Delete"}
            </button>
          </>
        }>
        <p>Delete <strong>Chapter {deleteModal?.number}</strong> of <strong>{deleteModal?.manga?.title}</strong>?</p>
      </Modal>
    </div>
  );
}
