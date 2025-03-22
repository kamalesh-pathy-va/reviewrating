import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { prisma } from "@/utils/db";
import { z } from "zod";

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!userDetails) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return userDetails;
  }),

  getUserById: publicProcedure
  .input(z.object({
    userId: z.string(),
    }))
    .query(async ({ input }) => {
      const userDetails = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          roles: true,
          ownedBrands: {
            select: { brand: { select: {name: true} } },
          },
          _count: { select: { reviews: true } },
        },
      });

      if (!userDetails) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        id: userDetails.id,
        name: userDetails.name,
        createdAt: userDetails.createdAt,
        roles: userDetails.roles,
        ownedBrands: userDetails.ownedBrands.map((ownedBrand) => ownedBrand.brand.name),
        reviewsCount: userDetails._count.reviews,
      };
    }
  ),
  searchUsers: publicProcedure
  .input(z.object({
    query: z.string().min(3),
  }))
  .query(async ({ input }) => {
    const { query } = input;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return users;
  }),
});
