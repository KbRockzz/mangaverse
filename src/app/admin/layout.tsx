"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Layers, Users, ArrowLeft } from "lucide-react";
import styles from "./Admin.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/manga", label: "Manga", icon: <BookOpen size={18} /> },
  { href: "/admin/chapters", label: "Chapters", icon: <Layers size={18} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className="gradient-text">Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}>
              {item.icon}<span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Back to site</Link>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
