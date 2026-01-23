import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { modules } from "./test.setup";

describe("Generations", () => {
  test("saveGeneration returns generation id", async () => {
    const t = convexTest(schema, modules);

    // Create a test user
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        emailVerificationTime: Date.now(),
      });
    });

    // Create a mock storage ID for the generated image
    const generatedImageId = await t.run(async (ctx) => {
      return await ctx.storage.store(new Blob(["test image"]));
    });

    // Create generation using internal mutation
    const generationId = await t.mutation(internal.generations.saveGeneration, {
      userId,
      prompt: "A cat sitting on a couch",
      characterMentions: [],
      generatedImageId,
      model: "dall-e-3",
    });

    expect(generationId).toBeDefined();
  });

  test("saveGeneration stores character mentions", async () => {
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

    // Create a mock storage ID for the generated image
    const generatedImageId = await t.run(async (ctx) => {
      return await ctx.storage.store(new Blob(["test image"]));
    });

    // Create generation with character mention using internal mutation
    const generationId = await t.mutation(internal.generations.saveGeneration, {
      userId,
      prompt: "@Sarah walking in a park",
      characterMentions: [{ characterId, characterName: "Sarah" }],
      generatedImageId,
      model: "dall-e-3",
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

    // Create multiple generations using direct db insert
    await t.run(async (ctx) => {
      const storageId1 = await ctx.storage.store(new Blob(["image1"]));
      const storageId2 = await ctx.storage.store(new Blob(["image2"]));

      await ctx.db.insert("generations", {
        userId,
        prompt: "First generation",
        characterMentions: [],
        generatedImageId: storageId1,
        createdAt: Date.now() - 1000,
      });
      await ctx.db.insert("generations", {
        userId,
        prompt: "Second generation",
        characterMentions: [],
        generatedImageId: storageId2,
        createdAt: Date.now(),
      });
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

    // Create generations for both users using direct db insert
    await t.run(async (ctx) => {
      const storageId1 = await ctx.storage.store(new Blob(["image1"]));
      const storageId2 = await ctx.storage.store(new Blob(["image2"]));

      await ctx.db.insert("generations", {
        userId: userId1,
        prompt: "User 1 generation",
        characterMentions: [],
        generatedImageId: storageId1,
        createdAt: Date.now(),
      });
      await ctx.db.insert("generations", {
        userId: userId2,
        prompt: "User 2 generation",
        characterMentions: [],
        generatedImageId: storageId2,
        createdAt: Date.now(),
      });
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

    const generationId = await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(new Blob(["test image"]));
      return await ctx.db.insert("generations", {
        userId,
        prompt: "Test generation",
        characterMentions: [],
        generatedImageId: storageId,
        createdAt: Date.now(),
      });
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
    const generationId = await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(new Blob(["test image"]));
      return await ctx.db.insert("generations", {
        userId: userId1,
        prompt: "User 1 generation",
        characterMentions: [],
        generatedImageId: storageId,
        createdAt: Date.now(),
      });
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

    // Create 5 generations using direct db insert
    await t.run(async (ctx) => {
      for (let i = 0; i < 5; i++) {
        const storageId = await ctx.storage.store(new Blob([`image${i}`]));
        await ctx.db.insert("generations", {
          userId,
          prompt: `Generation ${i}`,
          characterMentions: [],
          generatedImageId: storageId,
          createdAt: Date.now() - (5 - i) * 1000,
        });
      }
    });

    // Get only 3 recent
    const generations = await t
      .withIdentity({ subject: userId })
      .query(api.generations.getRecent, { limit: 3 });

    expect(generations).toHaveLength(3);
  });
});
