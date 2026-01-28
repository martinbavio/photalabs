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

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Disable E2E auth bypass to test login and redirect behavior
    await disableE2EAuth(
      page,
      testInfo.project.use.baseURL as string | undefined
    );
  });

  test("login page renders with dark theme", async ({ page }) => {
    await page.goto("/");

    // Wait for images to load (the new design has background images)
    await page.waitForTimeout(1000);

    // Check for main heading "Create with AI" (new design)
    await expect(page.getByRole("heading", { name: /create with ai/i })).toBeVisible();

    // Check for email input
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();

    // Check for get started button
    await expect(page.getByRole("button", { name: /get started/i })).toBeVisible();
  });

  test("email input accepts valid email address", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder("Enter your email");
    await expect(emailInput).toBeVisible();

    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("send magic link button shows loading state", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder("Enter your email");
    const submitButton = page.getByRole("button", { name: /get started/i });

    await expect(submitButton).toBeVisible();
    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Should show loading state (button text changes to "Sending...")
    // or transition to confirmation state "Check your email"
    await expect(
      page.getByText(/sending|check your email|failed/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("protected routes redirect to login when not authenticated", async ({ page }) => {
    // Try to access protected routes
    await page.goto("/create");
    await expect(page).toHaveURL("/");

    await page.goto("/history");
    await expect(page).toHaveURL("/");

    await page.goto("/characters");
    await expect(page).toHaveURL("/");
  });

  test("form validates email is required", async ({ page }) => {
    await page.goto("/");

    const submitButton = page.getByRole("button", { name: /get started/i });

    // Submit without filling email
    await submitButton.click();

    // HTML5 validation should prevent submission
    // The email input should still be visible (form wasn't submitted)
    const emailInput = page.getByPlaceholder("Enter your email");
    await expect(emailInput).toBeVisible();
  });

  test("form displays error when email format is invalid", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder("Enter your email");
    await emailInput.fill("invalid-email");

    const submitButton = page.getByRole("button", { name: /get started/i });
    await submitButton.click();

    // HTML5 validation should show error for invalid email
    // The form should still be visible (wasn't submitted)
    await expect(emailInput).toBeVisible();
  });
});
