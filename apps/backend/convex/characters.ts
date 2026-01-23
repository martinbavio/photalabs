import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

/**
 * Create a new character with name and reference images.
 * Requires 3-5 images for training consistency.
 */
export const create = mutation({
  args: {
    name: v.string(),
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate image count
    if (args.imageIds.length < MIN_IMAGES) {
      throw new Error(`Characters require at least ${MIN_IMAGES} reference images`);
    }
    if (args.imageIds.length > MAX_IMAGES) {
      throw new Error(`Characters can have at most ${MAX_IMAGES} reference images`);
    }

    // Validate name is not empty
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Character name is required");
    }

    return await ctx.db.insert("characters", {
      userId,
      name: trimmedName,
      imageIds: args.imageIds,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get a single character by ID.
 * Returns the character with resolved image URLs.
 */
export const get = query({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.id);
    if (!character) {
      return null;
    }

    // Resolve image URLs
    const imageUrls = await Promise.all(
      character.imageIds.map((id) => ctx.storage.getUrl(id))
    );

    return {
      ...character,
      imageUrls,
    };
  },
});

/**
 * Get all characters for the current user.
 * Returns characters sorted by creation date (newest first) with resolved image URLs.
 */
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Resolve image URLs for each character
    const charactersWithUrls = await Promise.all(
      characters.map(async (character) => {
        const imageUrls = await Promise.all(
          character.imageIds.map((id) => ctx.storage.getUrl(id))
        );
        return {
          ...character,
          imageUrls,
        };
      })
    );

    return charactersWithUrls;
  },
});

/**
 * Update an existing character's name and/or images.
 * Maintains the 3-5 image requirement.
 */
export const update = mutation({
  args: {
    id: v.id("characters"),
    name: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    // Verify ownership
    if (character.userId !== userId) {
      throw new Error("Not authorized to update this character");
    }

    const updates: Partial<{ name: string; imageIds: typeof args.imageIds }> = {};

    // Update name if provided
    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (!trimmedName) {
        throw new Error("Character name is required");
      }
      updates.name = trimmedName;
    }

    // Update images if provided
    if (args.imageIds !== undefined) {
      if (args.imageIds.length < MIN_IMAGES) {
        throw new Error(`Characters require at least ${MIN_IMAGES} reference images`);
      }
      if (args.imageIds.length > MAX_IMAGES) {
        throw new Error(`Characters can have at most ${MAX_IMAGES} reference images`);
      }
      updates.imageIds = args.imageIds;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Delete a character and all associated images from storage.
 */
export const remove = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    // Verify ownership
    if (character.userId !== userId) {
      throw new Error("Not authorized to delete this character");
    }

    // Delete all associated images from storage
    await Promise.all(
      character.imageIds.map((id) => ctx.storage.delete(id))
    );

    // Delete the character record
    await ctx.db.delete(args.id);
  },
});

/**
 * Search characters by name for @ mention suggestions.
 * Returns characters matching the search query.
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by name (case-insensitive)
    const searchLower = args.query.toLowerCase();
    const filtered = characters.filter((c) =>
      c.name.toLowerCase().includes(searchLower)
    );

    // Return with first image URL for avatar display
    const results = await Promise.all(
      filtered.map(async (character) => {
        const avatarUrl = character.imageIds[0]
          ? await ctx.storage.getUrl(character.imageIds[0])
          : null;
        return {
          _id: character._id,
          name: character.name,
          avatarUrl,
        };
      })
    );

    return results;
  },
});
