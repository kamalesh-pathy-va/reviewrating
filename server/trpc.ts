import { prisma } from "@/utils/db";
import { verifyJwt } from "@/utils/jwt";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";


export async function createContext({ req }: FetchCreateContextFnOptions) {

  const token = req.headers.get("authorization")?.split(" ")[1];

  let user = null;
  if (token) {
    try {
      const decoded = verifyJwt(token);
      if (decoded && typeof decoded === 'object' && "userId" in decoded) {
        user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
      }
    } catch (error) {
      console.error("Invalid token:", error)
    }
  }
  return { user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { user: ctx.user } });
});