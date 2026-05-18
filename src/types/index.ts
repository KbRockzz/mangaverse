export interface MangaDexManga {
  id: string;
  type: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    description: Record<string, string>;
    status: string;
    contentRating: string;
    tags: {
      id: string;
      attributes: { name: Record<string, string> };
    }[];
    createdAt: string;
    updatedAt: string;
  };
  relationships: {
    id: string;
    type: string;
    attributes?: Record<string, unknown>;
  }[];
}

export interface MangaDexChapter {
  id: string;
  attributes: {
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    createdAt: string;
  };
}

export interface DBManga {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  author: string | null;
  status: string;
  tags: string | null;
  mangadexId: string | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  chapters?: DBChapter[];
  bookmarks?: DBBookmark[];
  _count?: { chapters: number; bookmarks: number };
}

export interface DBChapter {
  id: string;
  number: number;
  title: string | null;
  mangaId: string;
  mangadexChapterId: string | null;
  pages?: string[];
  createdAt: Date;
  manga?: DBManga;
}

export interface DBUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBBookmark {
  id: string;
  userId: string;
  mangaId: string;
  createdAt: Date;
  manga?: DBManga;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalManga: number;
  totalChapters: number;
  totalUsers: number;
  totalBookmarks: number;
  mangaByStatus: { status: string; count: number }[];
  recentManga: DBManga[];
  monthlyManga: { month: string; count: number }[];
}
