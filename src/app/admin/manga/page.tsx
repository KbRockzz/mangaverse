"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useUpload } from "@/hooks/useUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination, Modal, LoadingScreen, EmptyState, ImageUpload, Spinner } from "@/components/ui";
import type { DBManga } from "@/types";

const mangaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["ongoing", "completed", "hiatus"]),
  tags: z.string().optional(),
});
type MangaForm = z.infer<typeof mangaSchema>;

export default function AdminMangaPage() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DBManga | null>(null);
  const [editing, setEditing] = useState<DBManga | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { preview, error: uploadError, selectFile, upload, uploading, clear: clearUpload } = useUpload();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MangaForm>({
    resolver: zodResolver(mangaSchema),
    defaultValues: { status: "ongoing" },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-manga", debouncedSearch, statusFilter, page],
    queryFn: () =>
      fetch(`/api/manga?search=${debouncedSearch}&status=${statusFilter}&page=${page}&limit=10`)
        .then((r) => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: MangaForm & { coverImage?: string }) => {
      const url = editing ? `/api/manga/${editing.id}` : "/api/manga";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        addToast("success", editing ? "Manga updated!" : "Manga created!");
        qc.invalidateQueries({ queryKey: ["admin-manga"] });
        setModalOpen(false);
        reset();
        clearUpload();
        setEditing(null);
      } else {
        addToast("error", data.error || "Failed");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/manga/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.success) {
        addToast("success", "Manga deleted");
        qc.invalidateQueries({ queryKey: ["admin-manga"] });
      }
      setDeleteModal(null);
    },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ status: "ongoing", title: "", author: "", description: "", tags: "" });
    clearUpload();
    setModalOpen(true);
  }, [reset, clearUpload]);

  const openEdit = useCallback((manga: DBManga) => {
    setEditing(manga);
    reset({
      title: manga.title,
      author: manga.author || "",
      description: manga.description || "",
      status: manga.status as "ongoing" | "completed" | "hiatus",
      tags: manga.tags ? JSON.parse(manga.tags).join(", ") : "",
    });
    clearUpload();
    setModalOpen(true);
  }, [reset, clearUpload]);

  const onSubmit = async (values: MangaForm) => {
    let coverImage = editing?.coverImage || undefined;
    if (preview) {
      const url = await upload();
      if (url) coverImage = url;
    }
    const tagsArr = values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    saveMutation.mutate({ ...values, tags: JSON.stringify(tagsArr), coverImage } as any);
  };

  const mangas: DBManga[] = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Manga Management</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={18} /> Add Manga</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search manga..." className="form-input" style={{ paddingLeft: "2.5rem" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="form-input" style={{ maxWidth: 160 }}>
          <option value="">All Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? <LoadingScreen /> : mangas.length === 0 ? (
        <EmptyState title="No manga found" message="Add your first manga or adjust the filters." />
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Cover</th><th>Title</th><th>Author</th><th>Status</th><th>Chapters</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {mangas.map((manga) => (
                  <tr key={manga.id}>
                    <td>
                      {manga.coverImage && <img src={manga.coverImage} alt={manga.title} style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 4 }} />}
                    </td>
                    <td style={{ fontWeight: 600, maxWidth: 200 }}>{manga.title}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{manga.author || "—"}</td>
                    <td><span className={`badge ${manga.status === "completed" ? "badge-success" : manga.status === "hiatus" ? "badge-warning" : "badge-info"}`}>{manga.status}</span></td>
                    <td>{manga._count?.chapters ?? 0}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(manga)}><Edit size={14} /></button>
                        <button className="btn-danger btn-sm" onClick={() => setDeleteModal(manga)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / 10)} onPageChange={setPage} />
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Edit Manga" : "Add New Manga"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending || uploading}>
              {saveMutation.isPending || uploading ? <Spinner size="sm" /> : editing ? "Save Changes" : "Create Manga"}
            </button>
          </>
        }>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ImageUpload preview={preview || editing?.coverImage || null} onSelect={selectFile} error={uploadError} label="Cover Image" />
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input {...register("title")} className={`form-input ${errors.title ? "error" : ""}`} />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Author</label>
            <input {...register("author")} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea {...register("description")} className="form-input form-textarea" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select {...register("status")} className="form-input">
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input {...register("tags")} className="form-input" placeholder="Action, Romance, Fantasy" />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Manga"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => deleteModal && deleteMutation.mutate(deleteModal.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Spinner size="sm" /> : "Delete"}
            </button>
          </>
        }>
        <p>Are you sure you want to delete <strong>&ldquo;{deleteModal?.title}&rdquo;</strong>? This will also delete all chapters.</p>
      </Modal>
    </div>
  );
}
