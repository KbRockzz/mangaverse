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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChapterForm>({
    resolver: zodResolver(chapterSchema),
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
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        addToast("success", editing ? "Chapter updated!" : "Chapter created!");
        qc.invalidateQueries({ queryKey: ["admin-chapters"] });
        setModalOpen(false); reset(); setEditing(null);
      } else { addToast("error", data.error || "Failed"); }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/chapters/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => { addToast("success", "Chapter deleted"); qc.invalidateQueries({ queryKey: ["admin-chapters"] }); setDeleteModal(null); },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ number: 1, title: "", mangaId: mangaFilter || "", mangadexChapterId: "" });
    setModalOpen(true);
  }, [reset, mangaFilter]);

  const openEdit = useCallback((ch: DBChapter) => {
    setEditing(ch);
    reset({ number: ch.number, title: ch.title || "", mangaId: ch.mangaId, mangadexChapterId: ch.mangadexChapterId || "" });
    setModalOpen(true);
  }, [reset]);

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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Edit Chapter" : "Add Chapter"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit((v) => saveMutation.mutate(v))} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Spinner size="sm" /> : editing ? "Save" : "Create"}
            </button>
          </>
        }>
        <form>
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
            <label className="form-label">MangaDex Chapter ID</label>
            <input {...register("mangadexChapterId")} className="form-input" placeholder="Optional MangaDex ID" />
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
