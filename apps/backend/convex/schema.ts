import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Note: Do NOT redefine the users table - authTables handles it.
  // User profile data is stored in the 'users' table managed by Convex Auth.

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
    generatedImageUrl: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
