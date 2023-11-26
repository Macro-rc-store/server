import SubcribeAppBootstrap from "./subcribe-app.bootstrap";
import config from '../../config/index.config';
import logger from '../logger/index.logger';
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express, {Express} from "express";
import snakeCaseToCamelCaseMiddleware from "../../app/middlewares/converter/request-converter.middleware";
import passport from '../../app/middlewares/auth/passport-jwt.middleware';
import actuator from "../../app/middlewares/actuator/actuator.middleware";
import appRouter from "../../app/router/index.router";
import { Server } from "socket.io";

class AppServer implements SubcribeAppBootstrap {
  app: Express;
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
  port: number;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = parseInt(config.app.port as string, 10);
  }

  applyMiddlewares() {
    const stream = {
      write: (message: string) => {
        logger.info(message.trim());
      }
    };

    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(passport.initialize());
    this.app.use(actuator({basePath: '/management'}));
    this.app.use(snakeCaseToCamelCaseMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('dev', { stream }));
    this.app.use(appRouter.getRouter());
  }


  startServer() {
    this.server.listen(this.port, () => {
      logger.info(`Service running on port:`, this.port);
    });
  }

  async subcribe() {
    this.applyMiddlewares();
    this.startServer();
  }
}

export default AppServer;