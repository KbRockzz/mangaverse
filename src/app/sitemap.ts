import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mangaverse.com'; // Change to actual production URL

  // Fetch local mangas for the sitemap
  const localMangas = await prisma.manga.findMany({
    take: 1000,
    select: { id: true, updatedAt: true },
  });

  const mangaEntries: MetadataRoute.Sitemap = localMangas.map((manga) => ({
    url: `${baseUrl}/manga/${manga.id}`,
    lastModified: manga.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...mangaEntries,
  ];
}
