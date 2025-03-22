import { authRouter } from './auth/index';
import { brandRouter } from './brand';
import { productRouter } from './product';
import { reviewRouter } from './review';
import { router } from "./trpc";
import { userRouter } from './user';

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  brand: brandRouter,
  review: reviewRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;