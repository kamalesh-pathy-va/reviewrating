import { authRouter } from './auth/index';
import { brandRouter } from './brand';
import { productRouter } from './product';
import { router } from "./trpc";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  brand: brandRouter,
});

export type AppRouter = typeof appRouter;