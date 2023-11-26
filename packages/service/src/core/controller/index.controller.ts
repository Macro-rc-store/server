import { Router, Request, Response, RequestHandler, NextFunction } from "express";
import { IResponse, IResponseError } from "../../app/dtos/response.dto";
import logger from "../logger/index.logger";
import { ValidationChain, validationResult } from "express-validator";
import AppUploader from "../upload/index.upload";
import { camelCaseToSnakeCase } from "../../shared/utils/common.util";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ControllerFunction = (
  req: Request, 
  res: Response,
  utils: UtilityFunctions
) => 
  Promise<Response<any, Record<string, any>>> | 
  Response<any, Record<string, any>>
;

export type UtilityFunctions = {
  success: (resResult: IResponse, code?: number) => Response<any, Record<string, any>>,
  error: (resError: IResponseError, code?: number) => Response<any, Record<string, any>>,
  upload: (fieldName: string, maxCount?: number | undefined) => Promise<{
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[] | undefined>,
  sendFile: (fileName: string, fileContent: string) => Response<any, Record<string, any>>
}

type Route = 
  [HttpMethod, string, ControllerFunction] | 
  [HttpMethod, string, ControllerFunction, ValidationChain[]];

type RouteConfig = Array<Route>;

interface IController {
  defineRoutes(): void;
}

abstract class BaseController implements IController {
  private router: Router;
  private routes: RouteConfig;
  private uploader: AppUploader;
  
  constructor() {
    this.router = Router();
    this.routes = [];
    this.uploader = new AppUploader();
  }

  safeHandler(controllerFunction: ControllerFunction) {
    return async (req: Request, res: Response) => {
      try {
        await controllerFunction.bind(this)(req, res, {
          success: this.success.bind(this, res),
          error: this.error.bind(this, res),
          upload: this.uploader.upload.bind(this.uploader, req, res),
          sendFile: this.sendFile.bind(this, res)
        });
      } catch (error: any) {
        logger.error('Request error', req.method, req.path, error.message, error.stack);
        res.status(500).json(<IResponse>{
          error: {
            message: 'Internal server error'
          }
        });
      }
    };
  }

  getRouter() {
    return this.router;
  }

  defineRoutes() {};

  initialize(routes?: RouteConfig) {
    this.routes = routes || [];
    this.defineRoutes();
    this.routes.forEach((route) => {
      const [method, path, handler, validations] = route;
      const safeHandler = this.safeHandler(handler);

      switch(method) {
        case 'GET':
          this.router.get(path, this.validate(validations || []), safeHandler);
          break;
        case 'POST':
          this.router.post(path, this.validate(validations || []), safeHandler);
          break;
        case 'PATCH':
          this.router.patch(path, this.validate(validations || []), safeHandler);
          break;
        case 'PUT':
          this.router.put(path, this.validate(validations || []), safeHandler);
          break;
        case 'DELETE':
          this.router.delete(path, this.validate(validations || []), safeHandler);
          break;
        default:
      }
    });
  }

  error(res: Response, resError: IResponseError, code?: number) {
    return res.status(code || 400).json(<IResponse> {
      error: resError
    });
  }

  success(res: Response, resResult: IResponse, code?: number) {
    if (resResult.data) {
      resResult.data = camelCaseToSnakeCase(resResult.data);
    }

    return res.status(code || 200).json(resResult);
  }

  sendFile(res: Response, fileName: string, fileContent: string) {
    res.attachment(fileName);
    return res.send(fileContent);
  }

  validate(validations: ValidationChain[]){
    return async (req: Request, res: Response, next: NextFunction) => {
      for (let validation of validations) {
        const result = await validation.run(req);
        const errors = result.array();
        if (errors.length) break;
      }
  
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
  
      this.error(res, {
        message: errors.array()[0]?.msg
      })
    };
  }
  
}

export default BaseController;