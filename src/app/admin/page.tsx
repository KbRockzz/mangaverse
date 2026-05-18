"use client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BookOpen, Layers, Users, Bookmark } from "lucide-react";
import { LoadingScreen } from "@/components/ui";
import type { DashboardStats } from "@/types";
import styles from "./Dashboard.module.css";

const COLORS = ["#ff6740", "#58a6ff", "#238636", "#d29922", "#f85149"];

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value.toLocaleString()}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
  });

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />;

  const stats = data?.data;
  if (!stats) return <p>Failed to load stats.</p>;

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: "2rem" }}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard icon={<BookOpen size={24} />} label="Total Manga" value={stats.totalManga} />
        <StatCard icon={<Layers size={24} />} label="Total Chapters" value={stats.totalChapters} />
        <StatCard icon={<Users size={24} />} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={<Bookmark size={24} />} label="Bookmarks" value={stats.totalBookmarks} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Manga Added by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyManga}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Manga by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.mangaByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={(entry: any) => `${entry.status}: ${entry.count}`}>
                {stats.mangaByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard} style={{ marginTop: "1.5rem" }}>
        <h3>Recently Added Manga</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Status</th><th>Chapters</th><th>Created</th></tr></thead>
            <tbody>
              {stats.recentManga.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.title}</td>
                  <td><span className={`badge ${m.status === "completed" ? "badge-success" : "badge-info"}`}>{m.status}</span></td>
                  <td>{m._count?.chapters ?? 0}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
