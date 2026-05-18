"use client";
import React from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)}><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  return <div className={`spinner ${size === "sm" ? "spinner-sm" : ""}`} />;
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="loading-container">
      <Spinner />
      <p>{message}</p>
    </div>
  );
}

export function Modal({
  open, onClose, title, children, footer,
}: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({
  currentPage, totalPages, onPageChange,
}: {
  currentPage: number; totalPages: number; onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        Prev
      </button>
      {start > 1 && <><button onClick={() => onPageChange(1)}>1</button><span>...</span></>}
      {pages.map((p) => (
        <button key={p} className={p === currentPage ? "active" : ""} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      {end < totalPages && <><span>...</span><button onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next
      </button>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function ImageUpload({
  preview, onSelect, error, label = "Upload Image",
}: {
  preview: string | null; onSelect: (file: File) => void;
  error: string | null; label?: string;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div
        style={{
          border: `2px dashed ${error ? "var(--danger)" : "var(--border-color)"}`,
          borderRadius: "var(--radius-md)", padding: "1.5rem",
          textAlign: "center", cursor: "pointer", background: "var(--bg-tertiary)",
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/jpeg,image/png,image/webp";
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) onSelect(f);
          };
          input.click();
        }}
      >
        {preview ? (
          <img src={preview} alt="Preview" style={{ maxHeight: 200, margin: "0 auto", borderRadius: "var(--radius-md)" }} />
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>Click to select image (max 5MB, jpg/png/webp)</p>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
