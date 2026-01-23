import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Generate an upload URL for client-side file uploads.
 * The URL is valid for a short period and can be used to POST a file directly to Convex storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a displayable URL from a storage ID.
 * Note: URLs are time-limited (~1 hour), so always resolve at read time.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get multiple displayable URLs at once (for character images).
 * Returns an array of URLs in the same order as the input storage IDs.
 */
export const getUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.storageIds.map((id) => ctx.storage.getUrl(id))
    );
  },
});

/**
 * Delete a file from storage.
 * Only authenticated users can delete files.
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await ctx.storage.delete(args.storageId);
  },
});
