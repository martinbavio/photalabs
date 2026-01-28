import { test, expect, Page } from "@playwright/test";

// Helper to disable E2E auth bypass (to test unauthenticated flows)
async function disableE2EAuth(page: Page, baseURL?: string) {
  const resolvedBaseURL = baseURL || "http://localhost:3000";
  const url = new URL(resolvedBaseURL);

  await page.context().addCookies([
    {
      name: "e2e_auth_disabled",
      value: "true",
      domain: url.hostname,
      path: "/",
    },
  ]);

  await page.addInitScript(() => {
    window.localStorage.setItem("e2e_auth_disabled", "true");
    document.cookie = "e2e_auth_disabled=true; path=/";
  });
}

test.describe("History - Unauthenticated", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Disable E2E auth bypass to test redirect behavior
    await disableE2EAuth(
      page,
      testInfo.project.use.baseURL as string | undefined
    );
  });

  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL("/");
  });
});

test.describe("History Page - Authenticated", () => {
  // E2E auth bypass is enabled by default when NEXT_PUBLIC_E2E=1

  test("displays History page title", async ({ page }) => {
    await page.goto("/history");

    const title = page.getByRole("heading", { name: "History" });
    await expect(title).toBeVisible();
  });

  test("displays image count subtitle", async ({ page }) => {
    await page.goto("/history");

    // Should show "X images created" text
    await expect(page.getByText(/\d+ images? created/i)).toBeVisible();
  });

  test("displays Recent sort button", async ({ page }) => {
    await page.goto("/history");

    const sortButton = page.getByRole("button", { name: /recent/i });
    await expect(sortButton).toBeVisible();
  });

  test("clicking sort button opens dropdown", async ({ page }) => {
    await page.goto("/history");

    const sortButton = page.getByRole("button", { name: /recent/i });
    await sortButton.click();

    // Dropdown should show sort options
    await expect(page.getByText("Most Recent")).toBeVisible();
    await expect(page.getByText("Oldest First")).toBeVisible();
  });

  test("displays empty state when no generations", async ({ page }) => {
    await page.goto("/history");

    // Wait for content to load
    await page.waitForTimeout(500);

    // Either shows images or empty state
    const hasEmptyState = await page.getByText(/no images yet/i).isVisible().catch(() => false);
    const hasImages = await page.locator('[class*="columns"]').isVisible().catch(() => false);

    expect(hasEmptyState || hasImages).toBeTruthy();
  });
});

test.describe("History Panel in Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create");
  });

  test("History button is visible in editor header", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await expect(historyButton).toBeVisible();
  });

  test("clicking History button opens panel", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Panel should appear with History title
    const panelTitle = page.locator("text=History").last();
    await expect(panelTitle).toBeVisible();
  });

  test("History panel shows recent generations count", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Panel should show generation count
    await expect(page.getByText(/\d+ recent generations?/i)).toBeVisible();
  });

  test("History panel has close button", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Find close button in panel
    const closeButton = page.locator('[aria-label="Close"]').or(
      page.locator('button').filter({ has: page.locator('svg') }).last()
    );
    await expect(closeButton).toBeVisible();
  });

  test("clicking backdrop closes History panel", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Panel should be open
    await expect(page.getByText(/recent generations?/i)).toBeVisible();

    // Click on backdrop (outside panel)
    await page.mouse.click(100, 400);

    // Panel should close - wait for animation
    await page.waitForTimeout(300);

    // The "recent generations" text inside the panel should not be visible
    const panelContent = page.getByText(/recent generations?/i);
    await expect(panelContent).not.toBeVisible();
  });

  test("pressing Escape closes History panel", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Panel should be open
    await expect(page.getByText(/recent generations?/i)).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    // Panel should close
    await page.waitForTimeout(300);
    const panelContent = page.getByText(/recent generations?/i);
    await expect(panelContent).not.toBeVisible();
  });

  test("History panel shows hint text", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    await expect(
      page.getByText(/click an item to restore it to the editor/i)
    ).toBeVisible();
  });
});

// These integration tests require a real Convex backend with data persistence.
// In E2E mode, auth is mocked but data is not persisted to a real database.
// These tests are skipped by default - run manually against a real backend.
test.describe.skip("History - Generation Flow Integration", () => {

  test("generates an image and it appears in history panel", async ({ page }) => {
    await page.goto("/create");

    // Enter a prompt
    const textarea = page.getByPlaceholder(/describe the image/i);
    await textarea.fill("A test image for history");

    // Generate
    const generateButton = page.getByRole("button", { name: /generate/i });
    await generateButton.click();

    // Wait for generation to complete
    await expect(
      page.getByText(/^Complete$/)
    ).toBeVisible({ timeout: 10000 });

    // Open history panel
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Should show at least 1 recent generation
    await expect(page.getByText(/[1-9]\d* recent generations?/i)).toBeVisible({ timeout: 5000 });
  });

  test("clicking history item restores prompt to editor", async ({ page }) => {
    // First generate an image
    await page.goto("/create");

    const textarea = page.getByPlaceholder(/describe the image/i);
    await textarea.fill("Unique test prompt for restore");

    const generateButton = page.getByRole("button", { name: /generate/i });
    await generateButton.click();

    await expect(
      page.getByText(/^Complete$/)
    ).toBeVisible({ timeout: 10000 });

    // Reset to clear the editor
    const resetButton = page.getByRole("button", { name: /reset/i });
    await resetButton.click();

    // Verify prompt is cleared
    await expect(textarea).toHaveValue("");

    // Open history panel
    const historyButton = page.getByRole("button", { name: /history/i });
    await historyButton.click();

    // Wait for panel to load
    await page.waitForTimeout(500);

    // Click on the first history item (most recent)
    const historyItems = page.locator("button").filter({ hasText: /unique test prompt/i });
    const firstItem = historyItems.first();

    if (await firstItem.isVisible()) {
      await firstItem.click();

      // Wait for panel to close and state to update
      await page.waitForTimeout(500);

      // Prompt should be restored
      await expect(textarea).toHaveValue("Unique test prompt for restore");
    }
  });
});

// This integration test requires a real Convex backend with data persistence.
// Skipped by default - run manually against a real backend.
test.describe.skip("History Page - Click to Restore", () => {

  test("clicking image card navigates to editor with restore param", async ({ page }) => {
    // First generate an image
    await page.goto("/create");

    const textarea = page.getByPlaceholder(/describe the image/i);
    await textarea.fill("Test for history page restore");

    const generateButton = page.getByRole("button", { name: /generate/i });
    await generateButton.click();

    await expect(
      page.getByText(/^Complete$/)
    ).toBeVisible({ timeout: 10000 });

    // Navigate to history page
    await page.goto("/history");

    // Wait for images to load
    await page.waitForTimeout(1000);

    // Click on first image card if visible
    const imageCards = page.locator('[class*="rounded-"][class*="cursor-pointer"]');

    if ((await imageCards.count()) > 0) {
      await imageCards.first().click();

      // Should navigate to create page with restore param
      await expect(page).toHaveURL(/\/create/);

      // Wait for restore to complete
      await page.waitForTimeout(500);

      // Prompt should be restored
      const restoredTextarea = page.getByPlaceholder(/describe the image/i);
      await expect(restoredTextarea).not.toHaveValue("");
    }
  });
});
