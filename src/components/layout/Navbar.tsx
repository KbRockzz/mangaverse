"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, TrendingUp, Clock, BookOpen, Menu, X, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
        setIsMenuOpen(false);
      }
    },
    [searchQuery, router]
  );

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={`${styles.navbarContainer} container`}>
        <Link href="/" className={styles.navbarLogo}>
          <BookOpen className={styles.logoIcon} />
          <span className={`${styles.logoText} gradient-text`}>Manga<span>Verse</span></span>
        </Link>

        <form className={styles.navbarSearch} onSubmit={handleSearch}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search manga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className={`${styles.navbarLinks} ${isMenuOpen ? styles.active : ""}`}>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <Home size={20} /><span>Home</span>
          </Link>
          <Link href="/search?order=followedCount" onClick={() => setIsMenuOpen(false)}>
            <TrendingUp size={20} /><span>Trending</span>
          </Link>
          <Link href="/search?order=createdAt" onClick={() => setIsMenuOpen(false)}>
            <Clock size={20} /><span>Latest</span>
          </Link>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                  <Shield size={20} /><span>Admin</span>
                </Link>
              )}
              <Link href="/profile" onClick={() => setIsMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {user?.image ? (
                  <img
                    src={user.image}
                    alt=""
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={20} />
                )}
                <span>{user?.name}</span>
              </Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className={styles.logoutBtn}>
                <LogOut size={20} /><span>Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>

        <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
