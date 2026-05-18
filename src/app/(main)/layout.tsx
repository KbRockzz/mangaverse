import Navbar from "@/components/layout/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>{children}</main>
      <footer className="main-footer container">
        <p>&copy; 2026 MangaVerse. Data provided by <a href="https://mangadex.org" target="_blank" rel="noreferrer">MangaDex</a>.</p>
      </footer>
    </>
  );
}
