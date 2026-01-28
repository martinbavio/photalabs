import { test, expect } from "@playwright/test";

// In E2E mode, authentication is bypassed by default (user is authenticated)
// This allows layout tests to access authenticated pages without extra setup

test.describe("Layout & Sidebar Navigation", () => {
  test("sidebar renders with PhotaLabs logo", async ({ page }) => {
    await page.goto("/create");

    // Check for logo text
    await expect(page.getByText("PhotaLabs", { exact: true })).toBeVisible();

    // Check sidebar is visible with correct background
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveCSS("background-color", "rgb(22, 22, 26)"); // #16161A
  });

  test("navigation items are visible", async ({ page }) => {
    await page.goto("/create");

    // Check all navigation items are visible
    await expect(page.getByRole("link", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("link", { name: "History" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Characters" })).toBeVisible();
    await expect(page.getByText("Explore")).toBeVisible();
  });

  test("Create nav item is highlighted when on /create page", async ({
    page,
  }) => {
    await page.goto("/create");

    const createLink = page.getByRole("link", { name: "Create" });
    await expect(createLink).toBeVisible();

    // Check active state - should have yellow background
    await expect(createLink).toHaveCSS(
      "background-color",
      "rgb(232, 231, 0)" // #e8e700
    );
  });

  test("History nav item is highlighted when on /history page", async ({
    page,
  }) => {
    await page.goto("/history");

    const historyLink = page.getByRole("link", { name: "History" });
    await expect(historyLink).toBeVisible();

    // Check active state - should have yellow background
    await expect(historyLink).toHaveCSS(
      "background-color",
      "rgb(232, 231, 0)" // #e8e700
    );
  });

  test("Characters nav item is highlighted when on /characters page", async ({
    page,
  }) => {
    await page.goto("/characters");

    const charactersLink = page.getByRole("link", { name: "Characters" });
    await expect(charactersLink).toBeVisible();

    // Check active state - should have yellow background
    await expect(charactersLink).toHaveCSS(
      "background-color",
      "rgb(232, 231, 0)" // #e8e700
    );
  });

  test("Create link navigates to /create", async ({ page }) => {
    await page.goto("/history");

    await page.getByRole("link", { name: "Create" }).click();
    await expect(page).toHaveURL("/create");
  });

  test("History link navigates to /history", async ({ page }) => {
    await page.goto("/create");

    await page.getByRole("link", { name: "History" }).click();
    await expect(page).toHaveURL("/history");
  });

  test("Characters link navigates to /characters", async ({ page }) => {
    await page.goto("/create");

    await page.getByRole("link", { name: "Characters" }).click();
    await expect(page).toHaveURL("/characters");
  });

  test("Explore item shows 'Soon' badge and is disabled", async ({ page }) => {
    await page.goto("/create");

    // Find the Explore navigation item (it's a div, not a link since it's disabled)
    const exploreItem = page.locator("nav").getByText("Explore");
    await expect(exploreItem).toBeVisible();

    // Check for "Soon" badge
    await expect(page.getByText("Soon", { exact: true })).toBeVisible();

    // Explore should not be a link (it's disabled)
    const exploreLink = page.getByRole("link", { name: "Explore" });
    await expect(exploreLink).not.toBeVisible();
  });

  test("user profile shows name and avatar initials", async ({ page }) => {
    await page.goto("/create");

    // Check for user name
    await expect(page.getByText("John Doe")).toBeVisible();

    // Check for avatar initials
    await expect(page.getByText("JD")).toBeVisible();

    // Check for credits display (mock user has 20 credits)
    await expect(page.getByText("20 credits left")).toBeVisible();
  });

  test("inactive navigation items have muted styling", async ({ page }) => {
    await page.goto("/create");

    // History and Characters should have muted color when not active
    const historyLink = page.getByRole("link", { name: "History" });
    await expect(historyLink).toHaveCSS("color", "rgb(107, 107, 112)"); // #6B6B70

    const charactersLink = page.getByRole("link", { name: "Characters" });
    await expect(charactersLink).toHaveCSS("color", "rgb(107, 107, 112)"); // #6B6B70
  });

  test("page content is displayed next to sidebar", async ({ page }) => {
    await page.goto("/create");

    // Check that the main content area is visible
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Check that the Create page header is visible
    await expect(page.getByText("Create Image")).toBeVisible();
  });

  test("sidebar width is 240px", async ({ page }) => {
    await page.goto("/create");

    const sidebar = page.locator("aside");
    const box = await sidebar.boundingBox();
    expect(box?.width).toBe(240);
  });
});
