import AppRouter from '../../core/router/index.router';
import AuthController from '../controllers/auth/auth.controller';
import passport from '../middlewares/auth/passport-jwt.middleware';
import AccountController from '../controllers/account.controller';
import limiter from '../middlewares/rate-limit/rate-limit.middleware';

const appRouter = new AppRouter();

appRouter.add([
  [
    "/api",
    [
      ['/accounts', AccountController],
    ],
    passport.authenticate('jwt', { session: false })
  ],
  ['/auth', AuthController, [limiter]]
]);

export default appRouter;