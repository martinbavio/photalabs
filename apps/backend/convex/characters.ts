import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all characters for the current user
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Resolve image URLs for each character
    return Promise.all(
      characters.map(async (character) => ({
        ...character,
        imageUrls: await Promise.all(
          character.imageIds.map((id) => ctx.storage.getUrl(id))
        ),
      }))
    );
  },
});

// Get a single character by ID
export const get = query({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const character = await ctx.db.get(args.id);
    if (!character || character.userId !== userId) return null;

    return {
      ...character,
      imageUrls: await Promise.all(
        character.imageIds.map((id) => ctx.storage.getUrl(id))
      ),
    };
  },
});

// Create a new character
export const create = mutation({
  args: {
    name: v.string(),
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate: 3-5 images required
    if (args.imageIds.length < 3 || args.imageIds.length > 5) {
      throw new Error("Characters require 3-5 reference images");
    }

    return await ctx.db.insert("characters", {
      userId,
      name: args.name,
      imageIds: args.imageIds,
      createdAt: Date.now(),
    });
  },
});

// Update a character
export const update = mutation({
  args: {
    id: v.id("characters"),
    name: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const character = await ctx.db.get(args.id);
    if (!character || character.userId !== userId) {
      throw new Error("Character not found");
    }

    const updates: Partial<{ name: string; imageIds: typeof args.imageIds }> =
      {};

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.imageIds !== undefined) {
      // Validate: 3-5 images required
      if (args.imageIds.length < 3 || args.imageIds.length > 5) {
        throw new Error("Characters require 3-5 reference images");
      }
      updates.imageIds = args.imageIds;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Delete a character and its associated images
export const remove = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const character = await ctx.db.get(args.id);
    if (!character || character.userId !== userId) {
      throw new Error("Character not found");
    }

    // Delete all associated images from storage
    await Promise.all(
      character.imageIds.map((imageId) => ctx.storage.delete(imageId))
    );

    // Delete the character
    await ctx.db.delete(args.id);
  },
});
