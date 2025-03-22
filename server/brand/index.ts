import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { prisma } from "@/utils/db";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const brandRouter = router({
  createBrand: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Brand name is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      
      const existingBrand = await prisma.brand.findUnique({
        where: {
          name: input.name
        },
      });

      if (existingBrand) {
        throw new TRPCError({
          "code": "FORBIDDEN",
          "message": "Brand with this name already exists.",
        });
      }

      const brand = await prisma.brand.create({
        data: {
          name: input.name,
          owners: {
            create: {
              userId: user.id,
            },
          },
        },
      });

      return brand;
    }),
  
  verifyBrand: protectedProcedure
    .input(z.object({
        brandId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { brandId } = input;

      const userRoles = await prisma.user.findUnique({
        where: { id: user.id },
        select: {roles: true},
      });
      
      const isAdmin = userRoles?.roles.some((role) => role.role === Role.ADMIN);
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized"
        });
      }

      const brandUser = await prisma.brandUser.findFirst({
        where: { brandId },
        orderBy: { userId: "asc" },
        select: {userId: true},
      });

      if (!brandUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Brand not found or has no associated users.",
        });
      }
      const existingRole = await prisma.userRole.findUnique({
        where: {
          userId_role: {
            userId: brandUser.userId,
            role: Role.OWNER,
          },
        },
      });

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: brandUser.userId,
            role: Role.OWNER,
          }
        })
      }

      const updatedBrand = await prisma.brand.update({
        where: {
          id: brandId,
          deletedAt: null,
        },
        data: { verified: true },
      });

      return updatedBrand;
    }),
  
  getAllBrands: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { limit, cursor } = input;

      const userRoles = await prisma.user.findUnique({
        where: { id: user.id },
        select: {roles: true},
      });

      const isAdmin = userRoles?.roles.some((role) => role.role === Role.ADMIN);

      const brands = await prisma.brand.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: "asc" },
        where: {
          deletedAt: null,
          ...(isAdmin ? {} : { verified: true }),
        },
      });

      let nextCursor: string | null = null;
      if (brands.length > limit) {
        const nextItem = brands.pop();
        nextCursor = nextItem?.id ?? null;
      }

      return {
        brands,
        nextCursor,
      };
    }),
  getBrandById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }))
    .query(async ({ input }) => {
      const { id } = input;

      const brand = await prisma.brand.findUnique({
        where: {
          id,
          verified: true,
          deletedAt: null
        }
      });

      if (!brand) {
        throw new TRPCError({
          "code": "NOT_FOUND",
          "message": "Brand not found"
        })
      }

      return brand;
    }),
  
  searchBrands: publicProcedure
  .input(z.object({
    query: z.string().min(1),
  }))
  .query(async ({ input }) => {
    const { query } = input;
    const queryParts = query.split(" ");

    const topBrands = await prisma.brand.findMany({
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
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return topBrands;
  }),
  
});