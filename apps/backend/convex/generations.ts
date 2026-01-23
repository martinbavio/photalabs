import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new generation with mock image URL
export const create = mutation({
  args: {
    prompt: v.string(),
    characterMentions: v.array(
      v.object({
        characterId: v.id("characters"),
        characterName: v.string(),
      })
    ),
    referenceImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate a mock image URL using picsum.photos with random seed
    const seed = Math.floor(Math.random() * 1000);
    const generatedImageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

    return await ctx.db.insert("generations", {
      userId,
      prompt: args.prompt,
      characterMentions: args.characterMentions,
      referenceImageId: args.referenceImageId,
      generatedImageUrl,
      createdAt: Date.now(),
    });
  },
});

// Get all generations for the current user, sorted by date descending
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const generations = await ctx.db
      .query("generations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Resolve reference image URLs for each generation
    return Promise.all(
      generations.map(async (generation) => ({
        ...generation,
        referenceImageUrl: generation.referenceImageId
          ? await ctx.storage.getUrl(generation.referenceImageId)
          : null,
      }))
    );
  },
});

// Get a single generation by ID
export const getById = query({
  args: { id: v.id("generations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const generation = await ctx.db.get(args.id);
    if (!generation || generation.userId !== userId) return null;

    return {
      ...generation,
      referenceImageUrl: generation.referenceImageId
        ? await ctx.storage.getUrl(generation.referenceImageId)
        : null,
    };
  },
});

// Get recent generations (limited count for history panel)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 10;

    const generations = await ctx.db
      .query("generations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return Promise.all(
      generations.map(async (generation) => ({
        ...generation,
        referenceImageUrl: generation.referenceImageId
          ? await ctx.storage.getUrl(generation.referenceImageId)
          : null,
      }))
    );
  },
});
