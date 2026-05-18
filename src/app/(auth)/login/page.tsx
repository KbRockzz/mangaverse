"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { BookOpen, Mail, Lock } from "lucide-react";
import { Spinner } from "@/components/ui";
import styles from "../Auth.module.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const addToast = useUIStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result?.error) {
        addToast("error", "Invalid email or password");
      } else {
        addToast("success", "Welcome back!");
        router.push("/");
        router.refresh();
      }
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
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label"><Mail size={14} /> Email</label>
            <input {...register("email")} type="email" className={`form-input ${errors.email ? "error" : ""}`} placeholder="admin@mangaverse.com" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label"><Lock size={14} /> Password</label>
            <input {...register("password")} type="password" className={`form-input ${errors.password ? "error" : ""}`} placeholder="••••••" />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Sign In"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
