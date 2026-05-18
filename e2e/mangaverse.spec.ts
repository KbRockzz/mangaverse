import { test, expect } from "@playwright/test";

test.describe("MangaVerse E2E Flows", () => {
  test("Homepage loads and has correct metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MangaVerse — Read Manga Online/);
    await expect(page.locator("h1").filter({ hasText: "Unleash Your Imagination" })).toBeVisible();
  });

  test("Navigation and Search Flow", async ({ page }) => {
    await page.goto("/");
    // Click on search link in nav
    await page.getByPlaceholder("Search manga...").click();
    await page.getByPlaceholder("Search manga...").fill("One Piece");
    await page.getByPlaceholder("Search manga...").press("Enter");

    // Wait for URL to update
    await expect(page).toHaveURL(/.*search\?q=One\+Piece/);
    await expect(page.locator("h1")).toContainText("Results for \"One Piece\"");
  });

  test("Login and Admin Dashboard protection", async ({ page }) => {
    // Unauthenticated user trying to access admin
    await page.goto("/admin");
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);

    // Perform login (using the seeded admin account)
    await page.getByPlaceholder("admin@mangaverse.com").fill("admin@mangaverse.com");
    await page.getByPlaceholder("••••••").fill("Admin123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // After login, should go to home page or admin
    await page.waitForURL("/");
    // Now navigate to admin
    await page.goto("/admin");
    await expect(page.locator("h1").filter({ hasText: "Dashboard" })).toBeVisible();
  });
});
