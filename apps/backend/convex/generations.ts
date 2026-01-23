import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Supported image generation models
const MODEL_TYPES = v.union(v.literal("dall-e-3"), v.literal("nano-banana-pro"));
type ModelType = "dall-e-3" | "nano-banana-pro";

// Internal query to get the current user ID (for use in actions)
export const getCurrentUserId = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

// Internal query to get character data with image URLs (for use in actions)
export const getCharacterImages = internalQuery({
  args: {
    characterIds: v.array(v.id("characters")),
  },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.characterIds.map(async (characterId) => {
        const character = await ctx.db.get(characterId);
        if (!character) return null;

        // Get URL for first image (primary image for character recognition)
        const imageUrl = character.imageIds[0]
          ? await ctx.storage.getUrl(character.imageIds[0])
          : null;

        return {
          characterId,
          name: character.name,
          imageUrl,
        };
      })
    );
    return results.filter((r) => r !== null);
  },
});

// Internal mutation to save generation record (called from action)
export const saveGeneration = internalMutation({
  args: {
    userId: v.id("users"),
    prompt: v.string(),
    characterMentions: v.array(
      v.object({
        characterId: v.id("characters"),
        characterName: v.string(),
      })
    ),
    referenceImageId: v.optional(v.id("_storage")),
    generatedImageId: v.id("_storage"),
    model: MODEL_TYPES,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      userId: args.userId,
      prompt: args.prompt,
      characterMentions: args.characterMentions,
      referenceImageId: args.referenceImageId,
      generatedImageId: args.generatedImageId,
      model: args.model,
      createdAt: Date.now(),
    });
  },
});

// Maximum prompt length for DALL-E 3
const DALLE_MAX_PROMPT_LENGTH = 4000;

// Action to generate image with DALL-E or Nano Banana Pro
export const generate = action({
  args: {
    prompt: v.string(),
    characterMentions: v.array(
      v.object({
        characterId: v.id("characters"),
        characterName: v.string(),
      })
    ),
    referenceImageId: v.optional(v.id("_storage")),
    model: v.optional(MODEL_TYPES),
  },
  handler: async (ctx, args): Promise<{ generationId: Id<"generations">; generatedImageId: Id<"_storage"> }> => {
    // Get the authenticated user ID using the internal query
    const userId = await ctx.runQuery(internal.generations.getCurrentUserId);
    if (!userId) throw new Error("Not authenticated");

    const model: ModelType = args.model ?? "dall-e-3";

    // Validate API keys
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
    }
    if (model === "nano-banana-pro" && !process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI API key not configured. Please set GOOGLE_AI_API_KEY environment variable.");
    }

    // Initialize OpenAI for vision analysis (used by both models)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build prompt with character context
    let fullPrompt = args.prompt;

    // If characters mentioned, analyze their images and include appearance descriptions
    if (args.characterMentions.length > 0) {
      const characterIds = args.characterMentions.map((c) => c.characterId);
      const characterData = await ctx.runQuery(internal.generations.getCharacterImages, {
        characterIds,
      });

      // Analyze each character's appearance with GPT-4 Vision (in parallel)
      const characterDescriptions = (
        await Promise.all(
          characterData
            .filter((character) => character.imageUrl)
            .map(async (character) => {
              const visionResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `Describe this person's physical appearance for use in image generation. Include: hair color/style, eye color, skin tone, facial features, and any distinctive characteristics. Be specific and concise. Start with "${character.name} is" and keep it under 50 words.`,
                      },
                      {
                        type: "image_url",
                        image_url: { url: character.imageUrl! },
                      },
                    ],
                  },
                ],
                max_tokens: 100,
              });

              return visionResponse.choices[0]?.message?.content;
            })
        )
      ).filter((desc): desc is string => desc !== null && desc !== undefined);

      if (characterDescriptions.length > 0) {
        fullPrompt = `${fullPrompt}. Character descriptions: ${characterDescriptions.join(" ")}`;
      }
    }

    // If reference image provided, use GPT-4 Vision to analyze and incorporate its style
    if (args.referenceImageId) {
      const referenceImageUrl = await ctx.storage.getUrl(args.referenceImageId);
      if (referenceImageUrl) {
        // Analyze reference image with GPT-4 Vision
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and describe its visual style, color palette, artistic technique, mood, and composition in a concise way that could be used to guide image generation. Focus on the aesthetic qualities. Keep it under 100 words.",
                },
                {
                  type: "image_url",
                  image_url: { url: referenceImageUrl },
                },
              ],
            },
          ],
          max_tokens: 150,
        });

        const styleDescription = visionResponse.choices[0]?.message?.content;
        if (styleDescription) {
          fullPrompt = `${fullPrompt}. Style reference: ${styleDescription}`;
        }
      }
    }

    // Validate prompt length for DALL-E 3
    if (model === "dall-e-3" && fullPrompt.length > DALLE_MAX_PROMPT_LENGTH) {
      throw new Error(
        `Prompt is too long (${fullPrompt.length} characters). DALL-E 3 has a maximum of ${DALLE_MAX_PROMPT_LENGTH} characters. Try reducing your prompt or using fewer character mentions.`
      );
    }

    // Generate image based on selected model
    let imageBlob: Blob;

    if (model === "nano-banana-pro") {
      // Generate with Nano Banana Pro (Gemini 3 Pro Image)
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

      // responseModalities is a valid config for image generation models but not in SDK types yet
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ["image", "text"],
        },
      } as Parameters<typeof geminiModel.generateContent>[0]);

      const response = result.response;
      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData?.mimeType?.startsWith("image/")
      );

      if (!imagePart?.inlineData) {
        throw new Error("Failed to generate image: no image data returned from Nano Banana Pro");
      }

      // Convert base64 to blob in both browser-like and Node runtimes
      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      const bytes =
        typeof atob === "function"
          ? Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0))
          : Buffer.from(base64Data, "base64");
      imageBlob = new Blob([bytes], { type: mimeType });
    } else {
      // Generate with DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageData = response.data?.[0];
      if (!imageData?.url) {
        throw new Error("Failed to generate image: no URL returned from DALL-E");
      }

      // Download the generated image
      const imageResponse = await fetch(imageData.url);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download generated image: ${imageResponse.status}`);
      }
      imageBlob = await imageResponse.blob();
    }

    // Store in Convex storage
    const generatedImageId = await ctx.storage.store(imageBlob);

    // Save generation record
    const generationId = await ctx.runMutation(internal.generations.saveGeneration, {
      userId,
      prompt: args.prompt,
      characterMentions: args.characterMentions,
      referenceImageId: args.referenceImageId,
      generatedImageId,
      model,
    });

    return { generationId, generatedImageId };
  },
});

// Helper to resolve generated image URL (handles both old and new records)
async function resolveGeneratedImageUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  generation: { generatedImageId?: Id<"_storage">; generatedImageUrl?: string }
): Promise<string | null> {
  // New records: resolve from storage
  if (generation.generatedImageId) {
    return await ctx.storage.getUrl(generation.generatedImageId);
  }
  // Legacy records: use URL directly
  return generation.generatedImageUrl ?? null;
}

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

    // Resolve image URLs for each generation
    return Promise.all(
      generations.map(async (generation) => ({
        ...generation,
        referenceImageUrl: generation.referenceImageId
          ? await ctx.storage.getUrl(generation.referenceImageId)
          : null,
        generatedImageUrl: await resolveGeneratedImageUrl(ctx, generation),
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
      generatedImageUrl: await resolveGeneratedImageUrl(ctx, generation),
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
        generatedImageUrl: await resolveGeneratedImageUrl(ctx, generation),
      }))
    );
  },
});
