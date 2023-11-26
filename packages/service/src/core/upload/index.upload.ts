import multer from "multer";
import { LIMIT_FILE_SIZE } from "./consts";
import { Request, Response } from "express";

class AppUploader {
  private storage: multer.StorageEngine;

  constructor() {
    this.storage = multer.memoryStorage();
  }

  fileFilter(req: any, file: any, cb: any) {
    const allowFileTypes = [
      'text/plain',
      'application/json'
    ];

    if (allowFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only text files are allowed."));
    }
  }

  upload(
    req: Request,
    res: Response,
    fieldName: string,
    maxCount?: number
  ): Promise<
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[]
    | undefined
  > {
    const uploader = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: LIMIT_FILE_SIZE,
      },
    }).array(fieldName, maxCount || 1);

    return new Promise((resolve, reject) => {
      uploader(req, res, function (error) {
        if (error) {
          return reject(error);
        }

        return resolve(req.files);
      });
    });
  }
}

export default AppUploader;
