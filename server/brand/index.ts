import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
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

      const brand = await prisma.brand.update({
        where: {
          id: brandId,
          deletedAt: null,
        },
        data: { verified: true },
      });

      return brand;
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

      return brands;
    }),
});