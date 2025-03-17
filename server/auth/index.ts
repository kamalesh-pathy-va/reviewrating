import { publicProcedure, router } from "../trpc"
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/utils/db"
import { signJwt } from "@/utils/jwt";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  signup: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      role: z.nativeEnum(Role).optional().default(Role.USER),
    }))
    .mutation(async ({ input }) => {
      const { name, email, password, role } = input;
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email already in use"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roles: { create: { role } },
        }
      });

      return { id: user.id, name: user.name, email: user.email };
    }),
  signin: publicProcedure
    .input(z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
    }))
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Email or Password"
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Email or Password"
        });
      }

      const token = signJwt({ userId: user.id });

      return { token, user: { id: user.id, name: user.name, email: user.email } };
    })
});