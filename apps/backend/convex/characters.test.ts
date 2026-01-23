import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { modules } from "./test.setup";
import { Id } from "./_generated/dataModel";

// Helper to create an authenticated test context
async function createAuthenticatedContext(t: ReturnType<typeof convexTest>) {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "test@example.com",
      emailVerificationTime: Date.now(),
    });
  });
  return { userId, authenticatedT: t.withIdentity({ subject: userId }) };
}

// Helper to create actual storage entries for testing
async function createStorageEntries(
  t: ReturnType<typeof convexTest>,
  count: number
): Promise<Id<"_storage">[]> {
  const storageIds: Id<"_storage">[] = [];
  for (let i = 0; i < count; i++) {
    const id = await t.run(async (ctx) => {
      // Store a small test blob
      const blob = new Blob([`test-content-${i}`], { type: "text/plain" });
      return await ctx.storage.store(blob);
    });
    storageIds.push(id);
  }
  return storageIds;
}

describe("Characters", () => {
  describe("create", () => {
    test("creates character with name and 3 imageIds", async () => {
      const t = convexTest(schema, modules);
      const { userId, authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "Sarah",
        imageIds,
      });

      expect(characterId).toBeDefined();

      const character = await t.run(async (ctx) => {
        return await ctx.db.get(characterId);
      });

      expect(character).not.toBe(null);
      expect(character?.name).toBe("Sarah");
      expect(character?.imageIds).toHaveLength(3);
      expect(character?.userId).toBe(userId);
    });

    test("creates character with 5 imageIds (maximum)", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 5);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "Marcus",
        imageIds,
      });

      const character = await t.run(async (ctx) => {
        return await ctx.db.get(characterId);
      });

      expect(character?.imageIds).toHaveLength(5);
    });

    test("fails if fewer than 3 images provided", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 2);

      await expect(
        authenticatedT.mutation(api.characters.create, {
          name: "Test",
          imageIds,
        })
      ).rejects.toThrow("Characters require at least 3 reference images");
    });

    test("fails if more than 5 images provided", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 6);

      await expect(
        authenticatedT.mutation(api.characters.create, {
          name: "Test",
          imageIds,
        })
      ).rejects.toThrow("Characters can have at most 5 reference images");
    });

    test("fails if name is empty", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      await expect(
        authenticatedT.mutation(api.characters.create, {
          name: "   ",
          imageIds,
        })
      ).rejects.toThrow("Character name is required");
    });

    test("fails if not authenticated", async () => {
      const t = convexTest(schema, modules);
      const imageIds = await createStorageEntries(t, 3);

      await expect(
        t.mutation(api.characters.create, {
          name: "Test",
          imageIds,
        })
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("get", () => {
    test("returns single character by ID with image URLs", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "Sarah",
        imageIds,
      });

      const character = await t.query(api.characters.get, { id: characterId });

      expect(character).not.toBe(null);
      expect(character?.name).toBe("Sarah");
      expect(character?._id).toBe(characterId);
      expect(character?.imageUrls).toHaveLength(3);
      // URLs should be resolved (not null)
      expect(character?.imageUrls.every((url) => url !== null)).toBe(true);
    });
  });

  describe("getByUser", () => {
    test("returns user's characters sorted by date desc", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds1 = await createStorageEntries(t, 3);

      // Create first character
      await authenticatedT.mutation(api.characters.create, {
        name: "First",
        imageIds: imageIds1,
      });

      // Small delay to ensure different createdAt timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const imageIds2 = await createStorageEntries(t, 3);
      // Create second character
      await authenticatedT.mutation(api.characters.create, {
        name: "Second",
        imageIds: imageIds2,
      });

      const characters = await authenticatedT.query(api.characters.getByUser, {});

      expect(characters).toHaveLength(2);
      // Newest first (desc order)
      expect(characters[0].name).toBe("Second");
      expect(characters[1].name).toBe("First");
      // Image URLs should be resolved
      expect(characters[0].imageUrls).toHaveLength(3);
    });

    test("returns empty array if not authenticated", async () => {
      const t = convexTest(schema, modules);
      const characters = await t.query(api.characters.getByUser, {});
      expect(characters).toEqual([]);
    });

    test("does not return other users' characters", async () => {
      const t = convexTest(schema, modules);

      // Create first user and their character
      const { authenticatedT: user1T } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);
      await user1T.mutation(api.characters.create, {
        name: "User1 Character",
        imageIds,
      });

      // Create second user
      const user2Id = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user2@example.com",
          emailVerificationTime: Date.now(),
        });
      });
      const user2T = t.withIdentity({ subject: user2Id });

      // User 2 should not see User 1's character
      const user2Characters = await user2T.query(api.characters.getByUser, {});
      expect(user2Characters).toHaveLength(0);
    });
  });

  describe("update", () => {
    test("updates character name", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "Original",
        imageIds,
      });

      await authenticatedT.mutation(api.characters.update, {
        id: characterId,
        name: "Updated",
      });

      const character = await t.query(api.characters.get, { id: characterId });
      expect(character?.name).toBe("Updated");
    });

    test("updates character images (maintains 3-5 requirement)", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "Test",
        imageIds,
      });

      const newImageIds = await createStorageEntries(t, 4);
      await authenticatedT.mutation(api.characters.update, {
        id: characterId,
        imageIds: newImageIds,
      });

      const character = await t.query(api.characters.get, { id: characterId });
      expect(character?.imageIds).toHaveLength(4);
    });

    test("fails if resulting images fewer than 3", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "Test",
        imageIds,
      });

      const tooFewImageIds = await createStorageEntries(t, 2);
      await expect(
        authenticatedT.mutation(api.characters.update, {
          id: characterId,
          imageIds: tooFewImageIds,
        })
      ).rejects.toThrow("Characters require at least 3 reference images");
    });

    test("fails if not authorized (different user)", async () => {
      const t = convexTest(schema, modules);

      // User 1 creates character
      const { authenticatedT: user1T } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);
      const characterId = await user1T.mutation(api.characters.create, {
        name: "User1 Character",
        imageIds,
      });

      // User 2 tries to update
      const user2Id = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user2@example.com",
          emailVerificationTime: Date.now(),
        });
      });
      const user2T = t.withIdentity({ subject: user2Id });

      await expect(
        user2T.mutation(api.characters.update, {
          id: characterId,
          name: "Hacked",
        })
      ).rejects.toThrow("Not authorized to update this character");
    });
  });

  describe("remove", () => {
    test("deletes character", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      const characterId = await authenticatedT.mutation(api.characters.create, {
        name: "ToDelete",
        imageIds,
      });

      await authenticatedT.mutation(api.characters.remove, { id: characterId });

      const character = await t.query(api.characters.get, { id: characterId });
      expect(character).toBe(null);
    });

    test("fails if not authorized (different user)", async () => {
      const t = convexTest(schema, modules);

      // User 1 creates character
      const { authenticatedT: user1T } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);
      const characterId = await user1T.mutation(api.characters.create, {
        name: "User1 Character",
        imageIds,
      });

      // User 2 tries to delete
      const user2Id = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "user2@example.com",
          emailVerificationTime: Date.now(),
        });
      });
      const user2T = t.withIdentity({ subject: user2Id });

      await expect(
        user2T.mutation(api.characters.remove, { id: characterId })
      ).rejects.toThrow("Not authorized to delete this character");
    });
  });

  describe("search", () => {
    test("finds characters by name (case-insensitive)", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds1 = await createStorageEntries(t, 3);

      await authenticatedT.mutation(api.characters.create, {
        name: "Sarah Johnson",
        imageIds: imageIds1,
      });

      const imageIds2 = await createStorageEntries(t, 3);
      await authenticatedT.mutation(api.characters.create, {
        name: "Marcus",
        imageIds: imageIds2,
      });

      const results = await authenticatedT.query(api.characters.search, {
        query: "sarah",
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Sarah Johnson");
    });

    test("returns empty array when no matches", async () => {
      const t = convexTest(schema, modules);
      const { authenticatedT } = await createAuthenticatedContext(t);
      const imageIds = await createStorageEntries(t, 3);

      await authenticatedT.mutation(api.characters.create, {
        name: "Sarah",
        imageIds,
      });

      const results = await authenticatedT.query(api.characters.search, {
        query: "John",
      });

      expect(results).toHaveLength(0);
    });
  });
});

describe("Storage", () => {
  test("generateUploadUrl requires authentication", async () => {
    const t = convexTest(schema, modules);

    await expect(t.mutation(api.storage.generateUploadUrl, {})).rejects.toThrow(
      "Not authenticated"
    );
  });

  test("generateUploadUrl returns URL for authenticated user", async () => {
    const t = convexTest(schema, modules);
    const { authenticatedT } = await createAuthenticatedContext(t);

    const url = await authenticatedT.mutation(api.storage.generateUploadUrl, {});
    expect(url).toBeDefined();
    expect(typeof url).toBe("string");
  });
});
