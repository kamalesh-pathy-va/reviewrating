import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { prisma } from "@/utils/db";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const productRouter = router({
  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Product name is required"),
        description: z.string().optional(),
        type: z.enum(["PRODUCT", "SERVICE"]),
        brandId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description, type, brandId } = input;
      const { user } = ctx; // Get user from context

      const product = await prisma.product.create({
        data: {
          name,
          description,
          type,
          brandId,
          createdById: user.id, // Ensure the product is linked to the authenticated user
        },
      });

      return product;
    }),
  
  updateProduct: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(["PRODUCT", "SERVICE"]),
      brandId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, name, description, type, brandId } = input;
      const userId = ctx.user.id;

      const product = await prisma.product.findUnique({
        where: {
          id,
          deletedAt: { equals: null },
        }
      });
      if (!product) {
        throw new TRPCError({
          "code": "NOT_FOUND",
          "message": "Product not found"
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          roles: true
        }
      });
      const isAdmin = user?.roles.some(r => r.role === Role.ADMIN);
      if (product.createdById !== userId && !isAdmin) {
        throw new TRPCError({
          "code": "UNAUTHORIZED",
          "message": "Not the owner, admin"
        });
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { name, description, type, brandId },
      });

      return updatedProduct;
    }),
  
  softDeleteProduct: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.user.id;

      const product = await prisma.product.findUnique({
        where: {
          id,
          deletedAt: { equals: null },
        }
      });
      if (!product) {
        throw new TRPCError({
          "code": "NOT_FOUND",
          "message": "Product not found"
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          roles: true
        }
      });
      const isAdmin = user?.roles.some(r => r.role === Role.ADMIN);
      if (product.createdById !== userId && !isAdmin) {
        throw new TRPCError({
          "code": "UNAUTHORIZED",
          "message": "Not the owner, admin"
        });
      }

      const softDeletedProduct = await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return softDeletedProduct;
    }),
  getProductById: publicProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ input }) => {
      const { id } = input;
      const product = await prisma.product.findUnique({
        where: { id, deletedAt: null },
      });

      if (!product) {
        throw new TRPCError({
          "code": "NOT_FOUND",
          message: "Product not found"
        });
      }

      return product;
    }),
  getAllProducts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      const { limit, cursor } = input;

      const products = await prisma.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: "asc" },
        where: { deletedAt: null},
      });

      let nextCursor: string | null = null;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem?.id ?? null;
      }

      return {
        products,
        nextCursor,
      };
    }),
});