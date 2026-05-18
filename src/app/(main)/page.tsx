import { fetchMangaList } from "@/lib/mangadex";
import HomeClient from "./HomeClient";

// ISR - revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  let trending = [];
  let latest = [];
  try {
    const [trendingRes, latestRes] = await Promise.all([
      fetchMangaList("followedCount", 10),
      fetchMangaList("createdAt", 10),
    ]);
    trending = trendingRes.data;
    latest = latestRes.data;
  } catch (error) {
    console.error("Error fetching home data:", error);
  }

  return <HomeClient trending={trending} latest={latest} />;
}
