import axios from "axios";

const BASE_URL = "https://api.mangadex.org";
const UPLOADS_URL = "https://uploads.mangadex.org";

const api = axios.create({ baseURL: BASE_URL });

export const getCoverUrl = (mangaId: string, fileName?: string): string => {
  if (!fileName) return "/placeholder-cover.png";
  return `${UPLOADS_URL}/covers/${mangaId}/${fileName}`;
};

export const fetchMangaList = async (
  order: string = "followedCount",
  limit: number = 20,
  offset: number = 0
) => {
  const params: Record<string, unknown> = {
    limit,
    offset,
    "includes[]": ["cover_art", "author", "artist"],
    "contentRating[]": ["safe", "suggestive"],
    "availableTranslatedLanguage[]": ["en"],
  };
  if (order === "followedCount") params["order[followedCount]"] = "desc";
  if (order === "createdAt") params["order[createdAt]"] = "desc";
  if (order === "rating") params["order[rating]"] = "desc";

  const response = await api.get("/manga", { params });
  return response.data;
};

export const fetchMangaDetails = async (id: string) => {
  const response = await api.get(`/manga/${id}`, {
    params: { "includes[]": ["cover_art", "author", "artist"] },
  });
  return response.data.data;
};

export const fetchChapterList = async (
  mangaId: string,
  offset: number = 0,
  limit: number = 100
) => {
  const response = await api.get(`/manga/${mangaId}/feed`, {
    params: {
      limit,
      offset,
      "translatedLanguage[]": ["en"],
      "order[chapter]": "desc",
      "includes[]": ["scanlation_group"],
    },
  });
  return response.data;
};

export const fetchChapterImages = async (chapterId: string) => {
  const response = await api.get(`/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = response.data;
  return chapter.data.map(
    (file: string) => `${baseUrl}/data/${chapter.hash}/${file}`
  );
};

export const searchManga = async (title: string, limit: number = 20) => {
  const response = await api.get("/manga", {
    params: {
      title,
      limit,
      "includes[]": ["cover_art"],
      "contentRating[]": ["safe", "suggestive"],
    },
  });
  return response.data;
};
