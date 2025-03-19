import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/utils/db";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const reviewRouter = router({
  postReview: protectedProcedure
  .input(z.object({
    productId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { productId, rating, comment } = input;

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

});