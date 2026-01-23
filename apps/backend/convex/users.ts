import { query, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Default credits for new users
const DEFAULT_CREDITS = 20;

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Get user credits
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      ...user,
      credits: userCredits?.credits ?? DEFAULT_CREDITS,
    };
  },
});

export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId !== null;
  },
});

// Internal query to get user credits (for use in actions)
export const getUserCredits = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return userCredits?.credits ?? DEFAULT_CREDITS;
  },
});

// Internal mutation to deduct a credit (creates record if doesn't exist)
export const deductCredit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (userCredits) {
      // Update existing record
      await ctx.db.patch(userCredits._id, {
        credits: userCredits.credits - 1,
      });
      return userCredits.credits - 1;
    } else {
      // Create new record with default credits minus one (for this generation)
      await ctx.db.insert("userCredits", {
        userId: args.userId,
        credits: DEFAULT_CREDITS - 1,
      });
      return DEFAULT_CREDITS - 1;
    }
  },
});
