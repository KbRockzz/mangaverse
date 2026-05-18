import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Helper to get a date X months ago (roughly 30 days per month)
  const getDateMonthsAgo = (months: number) => {
    const now = new Date();
    // subtract months * 30 days
    now.setMonth(now.getMonth() - months);
    return now;
  };
  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mangaverse.com" },
    update: {
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@mangaverse.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash("User123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@mangaverse.com" },
    update: {
      password: userPassword,
      role: "USER",
    },
    create: {
      email: "user@mangaverse.com",
      name: "Demo User",
      password: userPassword,
      role: "USER",
    },
  });

  // Create additional manga entries
  const mangas = [];
  for (let i = 4; i <= 10; i++) {
    const manga = await prisma.manga.upsert({
      where: { mangadexId: `sample-${i}` },
      update: {
        createdAt: getDateMonthsAgo(i - 3),
      },
      create: {
          createdAt: getDateMonthsAgo(i - 3),
        title: `Manga Title ${i}`,
        description: `Description for manga ${i}`,
        author: "Unknown Author",
        status: "ongoing",
        tags: JSON.stringify(["Action", "Fantasy"]),
        mangadexId: `sample-${i}`,
        viewCount: Math.floor(Math.random() * 5000),
      },
    });
    mangas.push(manga);
  }

  // Create sample manga
  const manga1 = await prisma.manga.upsert({
    where: { mangadexId: "sample-1" },
    update: {
      createdAt: getDateMonthsAgo(1),
    },
    create: {
        createdAt: getDateMonthsAgo(1),
      title: "One Piece",
      description: "A boy named Monkey D. Luffy sets out on a journey to find the legendary treasure One Piece and become the King of Pirates.",
      author: "Eiichiro Oda",
      status: "ongoing",
      tags: JSON.stringify(["Action", "Adventure", "Comedy"]),
      mangadexId: "sample-1",
      viewCount: 15000,
    },
  });

  const manga2 = await prisma.manga.upsert({
    where: { mangadexId: "sample-2" },
    update: {
      createdAt: getDateMonthsAgo(2),
    },
    create: {
      createdAt: getDateMonthsAgo(2),
      title: "Naruto",
      description: "Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage.",
      author: "Masashi Kishimoto",
      status: "completed",
      tags: JSON.stringify(["Action", "Adventure", "Martial Arts"]),
      mangadexId: "sample-2",
      viewCount: 12000,
    },
  });

  const manga3 = await prisma.manga.upsert({
    where: { mangadexId: "sample-3" },
    update: {
      createdAt: getDateMonthsAgo(3),
    },
    create: {
        createdAt: getDateMonthsAgo(3),
      title: "Attack on Titan",
      description: "In a world where humanity lives inside cities surrounded by enormous walls, a young boy vows to reclaim the world from the Titans.",
      author: "Hajime Isayama",
      status: "completed",
      tags: JSON.stringify(["Action", "Drama", "Fantasy"]),
      mangadexId: "sample-3",
      viewCount: 10000,
    },
  });

  // Create sample chapters
  for (const manga of [manga1, manga2, manga3, ...mangas]) {
    for (let i = 1; i <= 5; i++) {
      await prisma.chapter.upsert({
        where: { mangadexChapterId: `${manga.mangadexId}-ch-${i}` },
        update: {},
        create: {
          number: i,
          title: `Chapter ${i}`,
          mangaId: manga.id,
          mangadexChapterId: `${manga.mangadexId}-ch-${i}`,
        },
      });
    }
  }

  // Create bookmarks for demo user
  for (const manga of [manga1, manga2, manga3]) {
    await prisma.bookmark.upsert({
      where: {
        userId_mangaId: {
          userId: user.id,
          mangaId: manga.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        mangaId: manga.id,
      },
    });
  }

  console.log("✅ Seed data created successfully");
  console.log(`   Admin: admin@mangaverse.com / Admin123!`);
  console.log(`   User:  user@mangaverse.com / User123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
