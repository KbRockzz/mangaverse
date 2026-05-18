"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { BookOpen, Mail, Lock, User } from "lucide-react";
import { Spinner } from "@/components/ui";
import styles from "../Auth.module.css";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!result.success) {
        addToast("error", result.error || "Registration failed");
        return;
      }
      await login(data.email, data.password);
      addToast("success", "Account created successfully!");
      router.push("/");
      router.refresh();
    } catch {
      addToast("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <BookOpen size={32} style={{ color: "var(--accent-color)" }} />
          <h1 className="gradient-text">MangaVerse</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label"><User size={14} /> Name</label>
            <input {...reg("name")} className={`form-input ${errors.name ? "error" : ""}`} placeholder="Your name" />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label"><Mail size={14} /> Email</label>
            <input {...reg("email")} type="email" className={`form-input ${errors.email ? "error" : ""}`} placeholder="you@example.com" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={14} /> Password</label>
            <input {...reg("password")} type="password" className={`form-input ${errors.password ? "error" : ""}`} placeholder="••••••" />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={14} /> Confirm Password</label>
            <input {...reg("confirmPassword")} type="password" className={`form-input ${errors.confirmPassword ? "error" : ""}`} placeholder="••••••" />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Create Account"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
