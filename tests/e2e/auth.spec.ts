import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders with dark theme", async ({ page }) => {
    await page.goto("/");

    // Check dark background
    const body = page.locator("body");
    await expect(body).toHaveCSS("background-color", "rgb(11, 11, 14)"); // #0B0B0E

    // Check for logo
    await expect(page.getByText("PhotaLabs")).toBeVisible();

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

  test("send magic link button triggers form submission", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder("Enter your email");
    const submitButton = page.getByRole("button", { name: /send magic link/i });

    await expect(submitButton).toBeVisible();
    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Should show loading state or confirmation message
    // Note: In real tests, we'd mock the API call
    await expect(
      page.getByText(/check your email|sending link/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows confirmation message after sending magic link", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder("Enter your email");
    const submitButton = page.getByRole("button", { name: /send magic link/i });

    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Wait for confirmation message
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("test@example.com")).toBeVisible();
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

  test("use different email link resets form", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder("Enter your email");
    const submitButton = page.getByRole("button", { name: /send magic link/i });

    await emailInput.fill("test@example.com");
    await submitButton.click();

    // Wait for confirmation
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10000 });

    // Click "Use a different email"
    await page.getByText("Use a different email").click();

    // Should be back to sign in form
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
  });
});
