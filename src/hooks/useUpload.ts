"use client";
import { useState, useCallback } from "react";

interface UseUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useUpload(options: UseUploadOptions = {}) {
  const { maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/webp"] } = options;
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const validateFile = useCallback(
    (f: File): string | null => {
      if (!allowedTypes.includes(f.type)) {
        return `File type not allowed. Accepted: ${allowedTypes.join(", ")}`;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }
      return null;
    },
    [maxSizeMB, allowedTypes]
  );

  const selectFile = useCallback(
    (f: File) => {
      const validationError = validateFile(f);
      if (validationError) {
        setError(validationError);
        return false;
      }
      setError(null);
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
      return true;
    },
    [validateFile]
  );

  const upload = useCallback(async (): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, [file]);

  const clear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return { file, preview, error, uploading, selectFile, upload, clear };
}
