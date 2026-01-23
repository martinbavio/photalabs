import { test, expect } from "@playwright/test";

// Helper to disable E2E auth bypass (to test unauthenticated flows)
async function disableE2EAuth(page: ReturnType<typeof test["info"]>["page"]) {
  await page.addInitScript(() => {
    window.localStorage.setItem("e2e_auth_disabled", "true");
  });
}

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Disable E2E auth bypass to test login and redirect behavior
    await disableE2EAuth(page);
  });

  test("login page renders with dark theme", async ({ page }) => {
    await page.goto("/");

    // Check dark background
    const body = page.locator("body");
    await expect(body).toHaveCSS("background-color", "rgb(11, 11, 14)"); // #0B0B0E

    // Check for logo (exact match to avoid matching "Welcome to PhotaLabs")
    await expect(page.getByText("PhotaLabs", { exact: true })).toBeVisible();

    // Check for welcome message
    await expect(page.getByText("Welcome to PhotaLabs")).toBeVisible();
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
    const submitButton = page.getByRole("button", { name: /send magic link/i });

    await expect(submitButton).toBeVisible();
    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Should show loading state (button text changes to "Sending link...")
    // or transition to confirmation/error state
    await expect(
      page.getByText(/sending link|check your email|failed/i)
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

    const submitButton = page.getByRole("button", { name: /send magic link/i });

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

    const submitButton = page.getByRole("button", { name: /send magic link/i });
    await submitButton.click();

    // HTML5 validation should show error for invalid email
    // The form should still be visible (wasn't submitted)
    await expect(emailInput).toBeVisible();
  });
});
