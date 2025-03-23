import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { prisma } from "@/utils/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

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
          email: true,
          roles: true,
          _count: {
            select: {
              reviews: true,
              ownedBrands: true,
              products: true
            }
          },
        },
      });

      if (!userDetails) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        createdAt: userDetails.createdAt,
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

  updateUser: protectedProcedure.input(z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(6, "Password must be atleast 6 characters").optional(),
  }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, email, password } = input;

      if (!name && !email && !password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one field must be provided for update.",
        });
      }

      const updateData: Partial<{ name: string; email: string; password: string }> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return updatedUser;
  })
});
