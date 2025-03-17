import { authRouter } from './auth/index';
import { productRouter } from './product';
import { router } from "./trpc";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;