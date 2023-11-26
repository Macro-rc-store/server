import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';

function snackCaseToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelCaseKey = _.camelCase(key);
      result[camelCaseKey] = obj[key];
    }
  }

  return result;
}

export default function snakeCaseToCamelCaseMiddleware(req: Request, res: Response, next: NextFunction) {
  req.body = snackCaseToCamelCase(req.body);
  req.query = snackCaseToCamelCase(req.query);
  req.params = snackCaseToCamelCase(req.params);
  next();
}