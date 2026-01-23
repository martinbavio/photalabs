import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { modules } from "./test.setup";

describe("Authentication", () => {
  test("isAuthenticated returns false when not logged in", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.users.isAuthenticated, {});
    expect(result).toBe(false);
  });

  test("viewer returns null when not logged in", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.users.viewer, {});
    expect(result).toBe(null);
  });

  test("isAuthenticated returns true after authentication", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Query as authenticated user
    const result = await t.withIdentity({ subject: userId }).query(api.users.isAuthenticated, {});
    expect(result).toBe(true);
  });

  test("viewer returns user data after authentication", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        name: "Test User",
        emailVerificationTime: Date.now(),
      });
    });

    // Query as authenticated user
    const result = await t.withIdentity({ subject: userId }).query(api.users.viewer, {});
    expect(result).not.toBe(null);
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });
});
