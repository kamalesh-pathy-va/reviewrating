import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { prisma } from "@/utils/db";
import { TRPCError } from "@trpc/server";
import { ReviewStatus, Role } from "@prisma/client";

export const reviewRouter = router({
  postReview: protectedProcedure
  .input(z.object({
    productId: z.string(),
    title: z.string().min(1),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { productId, rating, comment, title } = input;

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (existingReview) {
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment ? comment : "",
          title,
          status: "APPROVED",
          updatedAt: new Date(),
        },
      });

      return updatedReview;
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment ? comment : "",
        productId,
        title,
        userId: user.id,
        status: "APPROVED",
      },
    });

    return review;
  }),

  deleteReview: protectedProcedure
  .input(z.object({
    reviewId: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { reviewId } = input;

    const review = await prisma.review.findUnique({
      where: { id: reviewId, deletedAt: null },
      select: { userId: true },
    });

    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    const isModeratorOrAdmin = userRoles.some(
      (role) => role.role === Role.ADMIN || role.role === Role.MODERATOR
    );

    if (review.userId !== user.id && !isModeratorOrAdmin) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: "Review deleted successfully" };
  }),
  
  changeReviewStatus: protectedProcedure
  .input(z.object({
      reviewId: z.string(),
      status: z.enum(["APPROVED", "REJECTED", "FLAGGED", "PENDING"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { reviewId, status } = input;

    const review = await prisma.review.findUnique({
      where: { id: reviewId, deletedAt: null },
      select: {
        product: {
          select: {
            brandId: true,
            brand: { select: { owners: { select: { userId: true } } } },
          },
        },
      },
    });

    if (!review) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Review not found"
      });
    }

    const brandOwners = review.product.brand?.owners.map((owner) => owner.userId) || [];

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    const isAdminOrModerator = userRoles.some(
      (role) => role.role === Role.ADMIN || role.role === Role.MODERATOR
    );

    const isOwner = brandOwners.includes(user.id);

    if (!isAdminOrModerator && !isOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Unauthorized"
      });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    return { success: true, message: `Review status updated to ${status}` };
  }),

  getReviewsByProductId: publicProcedure
  .input(z.object({
    productId: z.string(),
    limit: z.number().min(1).max(50).default(10),
    cursor: z.string().nullish(),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { productId, limit, cursor } = input;

    // Fetch product details along with brand ownership info
    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: {
        brandId: true,
        brand: { select: { owners: { select: { userId: true } } } },
      },
    });

    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found"
      });
    }

    let isAdminOrModerator = false;
    let isOwner = false;

    if (user) {
      const brandOwners = product.brand?.owners.map((owner) => owner.userId) || [];

      // Fetch user roles
      const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
        select: { role: true },
      });

      isAdminOrModerator = userRoles.some(
        (role) => role.role === Role.ADMIN || role.role === Role.MODERATOR
      );
      isOwner = brandOwners.includes(user.id);
    }

    // Fetch reviews based on role-based access
    const reviews = await prisma.review.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: "desc" },
      where: {
        productId,
        deletedAt: null,
        AND: [
          !user ?
            { status: ReviewStatus.APPROVED } :
            isAdminOrModerator || isOwner ? {} :
              {
                OR: [
                  { status: ReviewStatus.APPROVED },
                  { userId: user.id }
                ],
              },
        ],
      },
      select: {
        id: true,
        title: true,
        rating: true,
        comment: true,
        status: true,
        user: { select: { name: true, id: true, _count: { select: { reviews: true } } } },
        createdAt: true,
        updatedAt: true,
      },
    });

    const aggregation = await prisma.review.aggregate({
      where: {
        productId,
        deletedAt: null,
        AND: [
          !user ?
            { status: ReviewStatus.APPROVED } :
            isAdminOrModerator || isOwner ? {} :
              {
                OR: [
                  { status: ReviewStatus.APPROVED },
                  { userId: user.id}
                ],
              },
        ],
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      }
    })

    let nextCursor: string | null = null;
    if (reviews.length > limit) {
      const nextItem = reviews.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      reviews,
      aggregation,
      nextCursor
    };
  }),

  getReviewsByUserId: protectedProcedure
  .input(z.object({
    userId: z.string(),
    limit: z.number().min(1).max(50).default(10),
    cursor: z.string().nullish(),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { userId, limit, cursor } = input;

    // Fetch user roles
    const userRoles = await prisma.user.findUnique({
      where: { id: user.id },
      select: { roles: true },
    });

    const isAdminOrModerator = userRoles?.roles.some((role) =>
      ["ADMIN", "MODERATOR"].includes(role.role)
    );

    const whereCondition = user.id === userId || isAdminOrModerator
      ? { userId, deletedAt: null }
      : { userId, status: ReviewStatus.APPROVED, deletedAt: null };

    const reviews = await prisma.review.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      where: whereCondition,
    });

    let nextCursor: string | null = null;
    if (reviews.length > limit) {
      const nextItem = reviews.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      reviews,
      nextCursor,
    };
  }),

  getReviewsByBrandId: protectedProcedure
  .input(z.object({
    brandId: z.string(),
    limit: z.number().min(1).max(50).default(10),
    cursor: z.string().nullish(),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { brandId, limit, cursor } = input;

    // Fetch brand ownership details
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { owners: { select: { userId: true } } },
    });

    if (!brand) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
    }

    const brandOwners = brand.owners.map((owner) => owner.userId);

    // Fetch user roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    const isAdminOrModerator = userRoles.some(
      (role) => role.role === Role.ADMIN || role.role === Role.MODERATOR
    );
    const isBrandOwner = brandOwners.includes(user.id);

    // Fetch reviews for all products under the brand
    const reviews = await prisma.review.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      where: {
        product: { brandId },
        deletedAt: null,
        AND: [
          isAdminOrModerator || isBrandOwner ? {} :
            {
              OR: [
                { status: ReviewStatus.APPROVED },
                { userId: user.id }
              ]
            }
        ]
      },
      include: {
        product: true,
        user: { select: { name: true, id: true } },
      },
    });

    const aggregation = await prisma.review.aggregate({
      where: {
        product: { brandId },
        deletedAt: null,
        AND: [
          isAdminOrModerator || isBrandOwner ? {} :
            {
              OR: [
                { status: ReviewStatus.APPROVED },
                { userId: user.id }
              ]
            }
        ]
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      }
    });

    let nextCursor: string | null = null;
    if (reviews.length > limit) {
      const nextItem = reviews.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      reviews,
      aggregation,
      nextCursor,
    };
  }),
  
});