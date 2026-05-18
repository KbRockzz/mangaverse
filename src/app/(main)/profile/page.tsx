"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpload } from "@/hooks/useUpload";
import { useUIStore } from "@/store/uiStore";
import { ImageUpload, Spinner } from "@/components/ui";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, update } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const { preview, error: uploadError, selectFile, upload, uploading } = useUpload();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: any = { name };
      if (preview) {
        const url = await upload();
        if (url) payload.avatar = url;
      }
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (update) {
          await update({
            name,
            image: `/api/users/${user.id}/avatar?t=${Date.now()}`,
          });
        }
        addToast("success", "Profile updated!");
      } else {
        addToast("error", data.error || "Update failed");
      }
    } catch {
      addToast("error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container fade-in" style={{ maxWidth: 600, padding: "3rem 2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>
        <User size={24} style={{ verticalAlign: "middle", marginRight: 8 }} />
        My Profile
      </h1>

      <div style={{ background: "var(--bg-secondary)", padding: "2rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)" }}>
        <ImageUpload preview={preview || user.image || null} onSelect={selectFile} error={uploadError} label="Avatar" />

        <div className="form-group">
          <label className="form-label"><User size={14} /> Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label"><Mail size={14} /> Email</label>
          <input value={user.email} disabled className="form-input" style={{ opacity: 0.5 }} />
        </div>

        <div className="form-group">
          <label className="form-label"><Shield size={14} /> Role</label>
          <input value={user.role} disabled className="form-input" style={{ opacity: 0.5 }} />
        </div>

        <button onClick={handleSave} className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={saving || uploading}>
          {saving || uploading ? <Spinner size="sm" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
