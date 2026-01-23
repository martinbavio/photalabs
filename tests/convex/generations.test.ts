import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../apps/backend/convex/schema";
import { api } from "../../apps/backend/convex/_generated/api";

describe("generations", () => {
  describe("create", () => {
    it("creates a generation with prompt and stores it", async () => {
      const t = convexTest(schema);

      // Create a test user
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      // Mock authentication
      const asUser = t.withIdentity({ subject: userId });

      // Create a generation
      const generationId = await asUser.mutation(api.generations.create, {
        prompt: "A beautiful sunset",
        characterMentions: [],
      });

      expect(generationId).toBeDefined();

      // Verify it was stored
      const generation = await asUser.query(api.generations.getById, {
        id: generationId,
      });

      expect(generation).toBeDefined();
      expect(generation?.prompt).toBe("A beautiful sunset");
      expect(generation?.characterMentions).toEqual([]);
      expect(generation?.generatedImageUrl).toMatch(/picsum\.photos/);
    });

    it("creates a generation with character mentions", async () => {
      const t = convexTest(schema);

      // Create a test user
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      // Create a test character
      const characterId = await t.run(async (ctx) => {
        return await ctx.db.insert("characters", {
          userId,
          name: "TestChar",
          imageIds: [],
          createdAt: Date.now(),
        });
      });

      const asUser = t.withIdentity({ subject: userId });

      // Create a generation with character mention
      const generationId = await asUser.mutation(api.generations.create, {
        prompt: "A portrait of @TestChar",
        characterMentions: [
          {
            characterId,
            characterName: "TestChar",
          },
        ],
      });

      const generation = await asUser.query(api.generations.getById, {
        id: generationId,
      });

      expect(generation?.characterMentions).toHaveLength(1);
      expect(generation?.characterMentions[0].characterName).toBe("TestChar");
    });
  });

  describe("getByUser", () => {
    it("returns all user generations sorted by date descending", async () => {
      const t = convexTest(schema);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      // Create multiple generations with different timestamps
      await t.run(async (ctx) => {
        await ctx.db.insert("generations", {
          userId,
          prompt: "First generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/1.jpg",
          createdAt: Date.now() - 2000,
        });
        await ctx.db.insert("generations", {
          userId,
          prompt: "Second generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/2.jpg",
          createdAt: Date.now() - 1000,
        });
        await ctx.db.insert("generations", {
          userId,
          prompt: "Third generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/3.jpg",
          createdAt: Date.now(),
        });
      });

      const asUser = t.withIdentity({ subject: userId });

      const generations = await asUser.query(api.generations.getByUser, {});

      expect(generations).toHaveLength(3);
      // Should be sorted by date descending (newest first)
      expect(generations[0].prompt).toBe("Third generation");
      expect(generations[1].prompt).toBe("Second generation");
      expect(generations[2].prompt).toBe("First generation");
    });

    it("returns empty array when no generations exist", async () => {
      const t = convexTest(schema);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      const asUser = t.withIdentity({ subject: userId });

      const generations = await asUser.query(api.generations.getByUser, {});

      expect(generations).toEqual([]);
    });

    it("only returns generations for the authenticated user", async () => {
      const t = convexTest(schema);

      // Create two users
      const userId1 = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user1@example.com",
        });
      });

      const userId2 = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user2@example.com",
        });
      });

      // Create generations for both users
      await t.run(async (ctx) => {
        await ctx.db.insert("generations", {
          userId: userId1,
          prompt: "User 1 generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/1.jpg",
          createdAt: Date.now(),
        });
        await ctx.db.insert("generations", {
          userId: userId2,
          prompt: "User 2 generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/2.jpg",
          createdAt: Date.now(),
        });
      });

      const asUser1 = t.withIdentity({ subject: userId1 });

      const generations = await asUser1.query(api.generations.getByUser, {});

      expect(generations).toHaveLength(1);
      expect(generations[0].prompt).toBe("User 1 generation");
    });
  });

  describe("getById", () => {
    it("returns a single generation by ID", async () => {
      const t = convexTest(schema);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      const generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          prompt: "Test generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/test.jpg",
          createdAt: Date.now(),
        });
      });

      const asUser = t.withIdentity({ subject: userId });

      const generation = await asUser.query(api.generations.getById, {
        id: generationId,
      });

      expect(generation).toBeDefined();
      expect(generation?.prompt).toBe("Test generation");
    });

    it("returns null for non-existent generation", async () => {
      const t = convexTest(schema);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      // Create a generation to get a valid ID format, then delete it
      const generationId = await t.run(async (ctx) => {
        const id = await ctx.db.insert("generations", {
          userId,
          prompt: "Test",
          characterMentions: [],
          generatedImageUrl: "https://example.com/test.jpg",
          createdAt: Date.now(),
        });
        await ctx.db.delete(id);
        return id;
      });

      const asUser = t.withIdentity({ subject: userId });

      const generation = await asUser.query(api.generations.getById, {
        id: generationId,
      });

      expect(generation).toBeNull();
    });

    it("returns null for another user's generation", async () => {
      const t = convexTest(schema);

      const userId1 = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user1@example.com",
        });
      });

      const userId2 = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user2@example.com",
        });
      });

      // Create generation for user 1
      const generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId: userId1,
          prompt: "User 1 generation",
          characterMentions: [],
          generatedImageUrl: "https://example.com/test.jpg",
          createdAt: Date.now(),
        });
      });

      // User 2 tries to access it
      const asUser2 = t.withIdentity({ subject: userId2 });

      const generation = await asUser2.query(api.generations.getById, {
        id: generationId,
      });

      expect(generation).toBeNull();
    });
  });

  describe("getRecent", () => {
    it("returns limited recent generations", async () => {
      const t = convexTest(schema);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      // Create 15 generations
      await t.run(async (ctx) => {
        for (let i = 0; i < 15; i++) {
          await ctx.db.insert("generations", {
            userId,
            prompt: `Generation ${i}`,
            characterMentions: [],
            generatedImageUrl: `https://example.com/${i}.jpg`,
            createdAt: Date.now() - (15 - i) * 1000, // Oldest first in creation order
          });
        }
      });

      const asUser = t.withIdentity({ subject: userId });

      // Default limit of 10
      const generations = await asUser.query(api.generations.getRecent, {});

      expect(generations).toHaveLength(10);
      // Should be sorted by date descending (newest first)
      expect(generations[0].prompt).toBe("Generation 14");
    });

    it("respects custom limit", async () => {
      const t = convexTest(schema);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
        });
      });

      await t.run(async (ctx) => {
        for (let i = 0; i < 10; i++) {
          await ctx.db.insert("generations", {
            userId,
            prompt: `Generation ${i}`,
            characterMentions: [],
            generatedImageUrl: `https://example.com/${i}.jpg`,
            createdAt: Date.now() - (10 - i) * 1000,
          });
        }
      });

      const asUser = t.withIdentity({ subject: userId });

      const generations = await asUser.query(api.generations.getRecent, {
        limit: 5,
      });

      expect(generations).toHaveLength(5);
    });
  });
});
