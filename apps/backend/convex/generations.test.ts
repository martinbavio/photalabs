import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { modules } from "./test.setup";

describe("Generations", () => {
  test("create returns generation id when authenticated", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create generation as authenticated user
    const generationId = await t
      .withIdentity({ subject: userId })
      .mutation(api.generations.create, {
        prompt: "A cat sitting on a couch",
        characterMentions: [],
      });

    expect(generationId).toBeDefined();
  });

  test("create throws error when not authenticated", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.generations.create, {
        prompt: "A cat sitting on a couch",
        characterMentions: [],
      })
    ).rejects.toThrow("Not authenticated");
  });

  test("create stores character mentions", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create a character
    const characterId = await t.run(async (ctx) => {
      return await ctx.db.insert("characters", {
        userId,
        name: "Sarah",
        imageIds: [],
        createdAt: Date.now(),
      });
    });

    // Create generation with character mention
    const generationId = await t
      .withIdentity({ subject: userId })
      .mutation(api.generations.create, {
        prompt: "@Sarah walking in a park",
        characterMentions: [{ characterId, characterName: "Sarah" }],
      });

    // Verify the generation was stored correctly
    const generation = await t.run(async (ctx) => {
      return await ctx.db.get(generationId);
    });

    expect(generation?.characterMentions).toHaveLength(1);
    expect(generation?.characterMentions[0].characterName).toBe("Sarah");
  });

  test("getByUser returns empty array when not authenticated", async () => {
    const t = convexTest(schema, modules);

    const result = await t.query(api.generations.getByUser, {});
    expect(result).toEqual([]);
  });

  test("getByUser returns user generations sorted by date descending", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create multiple generations
    await t.withIdentity({ subject: userId }).mutation(api.generations.create, {
      prompt: "First generation",
      characterMentions: [],
    });

    await t.withIdentity({ subject: userId }).mutation(api.generations.create, {
      prompt: "Second generation",
      characterMentions: [],
    });

    // Get generations
    const generations = await t
      .withIdentity({ subject: userId })
      .query(api.generations.getByUser, {});

    expect(generations).toHaveLength(2);
    // Most recent should be first
    expect(generations[0].prompt).toBe("Second generation");
    expect(generations[1].prompt).toBe("First generation");
  });

  test("getByUser only returns own generations", async () => {
    const t = convexTest(schema, modules);

    // Create two test users
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "user1@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    const userId2 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "user2@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create generation for user1
    await t.withIdentity({ subject: userId1 }).mutation(api.generations.create, {
      prompt: "User 1 generation",
      characterMentions: [],
    });

    // Create generation for user2
    await t.withIdentity({ subject: userId2 }).mutation(api.generations.create, {
      prompt: "User 2 generation",
      characterMentions: [],
    });

    // Get generations as user1
    const user1Generations = await t
      .withIdentity({ subject: userId1 })
      .query(api.generations.getByUser, {});

    expect(user1Generations).toHaveLength(1);
    expect(user1Generations[0].prompt).toBe("User 1 generation");
  });

  test("getById returns null when not authenticated", async () => {
    const t = convexTest(schema, modules);

    // Create a user and generation
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    const generationId = await t
      .withIdentity({ subject: userId })
      .mutation(api.generations.create, {
        prompt: "Test generation",
        characterMentions: [],
      });

    // Try to get without authentication
    const result = await t.query(api.generations.getById, { id: generationId });
    expect(result).toBe(null);
  });

  test("getById returns null for other user's generation", async () => {
    const t = convexTest(schema, modules);

    // Create two test users
    const userId1 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "user1@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    const userId2 = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "user2@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create generation for user1
    const generationId = await t
      .withIdentity({ subject: userId1 })
      .mutation(api.generations.create, {
        prompt: "User 1 generation",
        characterMentions: [],
      });

    // Try to get as user2
    const result = await t
      .withIdentity({ subject: userId2 })
      .query(api.generations.getById, { id: generationId });

    expect(result).toBe(null);
  });

  test("getRecent respects limit parameter", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create 5 generations
    for (let i = 0; i < 5; i++) {
      await t
        .withIdentity({ subject: userId })
        .mutation(api.generations.create, {
          prompt: `Generation ${i}`,
          characterMentions: [],
        });
    }

    // Get only 3 recent
    const generations = await t
      .withIdentity({ subject: userId })
      .query(api.generations.getRecent, { limit: 3 });

    expect(generations).toHaveLength(3);
  });
});
