import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Note: Do NOT redefine the users table - authTables handles it.
  // User profile data is stored in the 'users' table managed by Convex Auth.

  userCredits: defineTable({
    userId: v.id("users"),
    credits: v.number(), // Number of image generation credits remaining
  }).index("by_user", ["userId"]),

  characters: defineTable({
    userId: v.id("users"),
    name: v.string(),
    imageIds: v.array(v.id("_storage")), // 3-5 images (minimum 3 required)
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  generations: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    // Store both IDs and names for referential integrity
    // Names are denormalized so history renders even if character is deleted
    characterMentions: v.array(
      v.object({
        characterId: v.id("characters"),
        characterName: v.string(),
      })
    ),
    referenceImageId: v.optional(v.id("_storage")),
    // Legacy: old records have generatedImageUrl (external picsum URL)
    // New: DALL-E records have generatedImageId (Convex storage)
    generatedImageUrl: v.optional(v.string()),
    generatedImageId: v.optional(v.id("_storage")),
    // Model used for generation (optional for backward compatibility)
    // "dall-e-3" or "nano-banana-pro"
    model: v.optional(v.union(v.literal("dall-e-3"), v.literal("nano-banana-pro"))),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
