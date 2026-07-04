import { z } from "zod";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import {
  getAllMods,
  searchMods,
  getModsByCategory,
  getModById,
  createMod,
  updateMod,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getModReviews,
  createReview,
  updateReview,
} from "./db";

export const modRouter = router({
  // Public endpoints
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(({ input }) => getAllMods(input.limit, input.offset)),

  search: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(({ input }) => searchMods(input.query, input.limit, input.offset)),

  byCategory: publicProcedure
    .input(z.object({
      category: z.string(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(({ input }) => getModsByCategory(input.category, input.limit, input.offset)),

  detail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getModById(input.id)),

  reviews: publicProcedure
    .input(z.object({ modId: z.number() }))
    .query(({ input }) => getModReviews(input.modId)),

  // Protected endpoints
  favorites: protectedProcedure
    .query(({ ctx }) => getUserFavorites(ctx.user.id)),

  addFavorite: protectedProcedure
    .input(z.object({ modId: z.number() }))
    .mutation(({ ctx, input }) => addFavorite(ctx.user.id, input.modId)),

  removeFavorite: protectedProcedure
    .input(z.object({ modId: z.number() }))
    .mutation(({ ctx, input }) => removeFavorite(ctx.user.id, input.modId)),

  addReview: protectedProcedure
    .input(z.object({
      modId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(({ ctx, input }) =>
      createReview({
        userId: ctx.user.id,
        modId: input.modId,
        rating: input.rating,
        comment: input.comment,
      })
    ),

  // Admin endpoints
  create: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      author: z.string(),
      version: z.string(),
      category: z.string(),
      tags: z.string().optional(),
      downloadUrl: z.string().url(),
      sourceUrl: z.string().url().optional(),
      sourceType: z.enum(["github", "nexus", "other"]),
      imageUrl: z.string().url().optional(),
      compatible: z.string().optional(),
    }))
    .mutation(({ input }) =>
      createMod({
        name: input.name,
        description: input.description,
        author: input.author,
        version: input.version,
        category: input.category,
        tags: input.tags,
        downloadUrl: input.downloadUrl,
        sourceUrl: input.sourceUrl,
        sourceType: input.sourceType,
        imageUrl: input.imageUrl,
        compatible: input.compatible,
      })
    ),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      version: z.string().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      imageUrl: z.string().url().optional(),
      compatible: z.string().optional(),
      rating: z.number().optional(),
      downloads: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      return updateMod(id, updates);
    }),
});
