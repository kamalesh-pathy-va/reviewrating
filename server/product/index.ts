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

      let isVerified = false;

      if (brandId) {
        // Check if the user is an owner of the brand
        const brandOwner = await prisma.brandUser.findFirst({
          where: {
            brandId,
            userId: user.id,
          },
        });

        if (brandOwner) {
          isVerified = true; // If the user is a brand owner, auto-verify the product
        }
      }

      const product = await prisma.product.create({
        data: {
          name,
          description,
          type,
          brandId,
          createdById: user.id, // Ensure the product is linked to the authenticated user
          verified: isVerified
        },
      });

      return product;
    }),
  
  updateProduct: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(["PRODUCT", "SERVICE"]).optional(),
      brandId: z.string().optional(),
      verified: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, name, description, type, brandId, verified } = input;
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
      
      let isBrandOwner = false;
      if (product.brandId && product.verified) {
        const brandOwner = await prisma.brandUser.findFirst({
          where: {
            brandId: product.brandId,
            userId,
          },
        });

        if (brandOwner) {
          isBrandOwner = true;
        }
      } else { 
        const brandOwner = await prisma.brandUser.findFirst({
          where: {
            userId,
          },
        });

        if (brandOwner) {
          isBrandOwner = true;
        }
      }

      if (product.verified) {
        if (!isBrandOwner && !isAdmin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only brand owners and admins can update a verified product",
          });
        }
      } else {
        if ((verified !== undefined || brandId !== undefined) && !isBrandOwner && !isAdmin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only brand owners can update the brand or verified status",
          });
        }
      }

      if (product.createdById !== userId && !isAdmin && !isBrandOwner) {
        throw new TRPCError({
          "code": "UNAUTHORIZED",
          "message": "Not the owner, admin or brand owner"
        });
      }

      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (brandId !== undefined) updateData.brandId = brandId;
      if (verified !== undefined) updateData.verified = verified;

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
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

      await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true, message: "Product deleted successfully" };
    }),
  
  getProductById: publicProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ input }) => {
      const { id } = input;
      const product = await prisma.product.findUnique({
        where: { id, deletedAt: null },
        select: {
          name: true,
          id: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          type: true,
          verified: true,
          brand: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: {
            select: {
              reviews: true
            },
          },
        }
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
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          verified: true,
          brand: { select: { id: true, name: true } },
          reviews: {
            select: {
              rating: true,
            }
          }
        },
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
  
  mergeProducts: protectedProcedure
  .input(
    z.object({
      targetProductId: z.string(), // The product that remains
      mergeProductId: z.string(), // The product that will be merged
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { targetProductId, mergeProductId } = input;
    const userId = ctx.user.id;

    // Fetch both products
    const targetProduct = await prisma.product.findUnique({
      where: { id: targetProductId, deletedAt: null, brandId: {not: null} },
    });

    const mergeProduct = await prisma.product.findUnique({
      where: { id: mergeProductId, deletedAt: null, brandId: {not: null} },
    });

    if (!targetProduct || !mergeProduct) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "One or both products not found",
      });
    }

    if (targetProduct.brandId !== mergeProduct.brandId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Products must belong to the same brand to be merged",
      });
    }

    // Check if the user is a brand owner
    const brandOwner = await prisma.brandUser.findFirst({
      where: {
        brandId: targetProduct.brandId as string,
        userId,
      },
    });

    if (!brandOwner) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only brand owners can merge products",
      });
    }

    // Get all reviews from both products
    const reviews = await prisma.review.findMany({
      where: {
        productId: { in: [targetProductId, mergeProductId] },
      },
    });

    // Handle duplicate reviews from the same user
    const uniqueReviews: Record<string, { id: string; rating: number }> = {};

    for (const review of reviews) {
      if (!uniqueReviews[review.userId] || review.rating > uniqueReviews[review.userId].rating) {
        uniqueReviews[review.userId] = { id: review.id, rating: review.rating };
      }
    }

    // Move only the highest-rated reviews
    await prisma.review.updateMany({
      where: {
        id: { in: Object.values(uniqueReviews).map((r) => r.id) },
      },
      data: {
        productId: targetProductId,
      },
    });

    // Permanently delete the lower-rated duplicate reviews
    await prisma.review.deleteMany({
      where: {
        productId: mergeProductId,
        id: { notIn: Object.values(uniqueReviews).map((r) => r.id) },
      },
    });

    // Delete the merged product permanently
    await prisma.product.delete({
      where: { id: mergeProductId },
    });

    return { message: "Products merged successfully", targetProductId };
  }),

  searchProducts: publicProcedure
  .input(z.object({
    query: z.string().min(3),
  }))
  .query(async ({ input }) => {
    const { query } = input;
    const queryParts = query.split(" ");

    const topProducts = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: queryParts.map(part => ({
              name: { contains: part, mode: "insensitive" }, // Match any word in product name
            })),
          },
          { deletedAt: null },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        brand: { select: { id: true, name: true } },
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return topProducts;
  }),

  getProductByUserId: protectedProcedure
  .input(z.object({
    userId: z.string(),
    limit: z.number().min(1).max(50).default(5),
    cursor: z.string().nullish(),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { limit, cursor, userId } = input;

    const userRoles = await prisma.user.findUnique({
      where: { id: user.id },
      select: { roles: true },
    });

    const isAdminOrModerator = userRoles?.roles.some(role => (role.role === Role.ADMIN || role.role === Role.MODERATOR));

    if (!user) {
      throw new TRPCError({
        "code": "UNAUTHORIZED",
        "message": "User not logged in",
      });
    }

    if (!isAdminOrModerator && !(user.id === userId)) {
      throw new TRPCError({
        "code": "UNAUTHORIZED",
        "message": "Not Admin, Moderator and not current user"
      });
    }

    const products = await prisma.product.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { name: "asc" },
      where: {
        deletedAt: null,
        createdById: userId,
      },
      select: {
        name: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        type: true,
        verified: true,
        brand: {
          select: {
            name: true,
            id: true,
          }
        },
        reviews: {
          select: {
            rating: true,
          }
        },
      },
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