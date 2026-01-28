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

// Combined query to avoid waterfall - returns both user data and auth status in one request
export const viewerWithAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { user: null, isAuthenticated: false };
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return { user: null, isAuthenticated: false };
    }

    // Get user credits
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      user: {
        ...user,
        credits: userCredits?.credits ?? DEFAULT_CREDITS,
      },
      isAuthenticated: true,
    };
  },
});

// Internal mutation to atomically reserve a credit (check + deduct in one transaction)
// This prevents race conditions from concurrent generations
export const reserveCredit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (userCredits) {
      // Check if user has credits
      if (userCredits.credits <= 0) {
        throw new Error("No credits remaining");
      }
      // Atomically deduct credit
      await ctx.db.patch(userCredits._id, {
        credits: userCredits.credits - 1,
      });
      return userCredits.credits - 1;
    } else {
      // First-time user: create record with default credits minus one
      await ctx.db.insert("userCredits", {
        userId: args.userId,
        credits: DEFAULT_CREDITS - 1,
      });
      return DEFAULT_CREDITS - 1;
    }
  },
});

// Internal mutation to refund a credit (called when generation fails)
export const refundCredit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (userCredits) {
      await ctx.db.patch(userCredits._id, {
        credits: userCredits.credits + 1,
      });
      return userCredits.credits + 1;
    }
    // If no record exists, this shouldn't happen but create with default
    await ctx.db.insert("userCredits", {
      userId: args.userId,
      credits: DEFAULT_CREDITS,
    });
    return DEFAULT_CREDITS;
  },
});
