import express, { RequestHandler, Router } from 'express';
import BaseController from "../controller/index.controller";

type Controller = (new () => BaseController);

type Middlewares = Array<RequestHandler<any>>;

type Route = 
  [string, Controller] | 
  [string, Route[]] |
  [string, Controller, Middlewares] | 
  [string, Route[], Middlewares]
;

class AppRouter {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  getRouter() {
    return this.router;
  }

  add(routes: Route[]) {
    routes.forEach(route => {
      const [path, handlerOrSubRoutes, middlewares] = route;
      if (Array.isArray(handlerOrSubRoutes)) {
        const subRouter = new AppRouter();
        subRouter.add(handlerOrSubRoutes);

        if (middlewares && middlewares.length > 0) {
          this.router.use(path, middlewares, subRouter.router);
        } else {
          this.router.use(path, subRouter.router);
        }
      } else {
        const router = new handlerOrSubRoutes().getRouter();

        if (middlewares && middlewares.length > 0) {
          this.router.use(path, middlewares, router);
        } else {
          this.router.use(path, router);
        }
      }
    });
  }
}

export default AppRouter;
