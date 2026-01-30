import { NextFunction, Request, Response } from "express";
import { GetStorageFilesForSelectDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getStorageFilesForSelectValidation = (
  req: Request<any, any, GetStorageFilesForSelectDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  // const schemaValidation = Joi.object({
  //   accountId: Joi.number().required(),
  // });

  // const validation = schemaValidation.validate(req.body, { abortEarly: false });

  // if (validation.error) {
  //   const errors = validation.error.details.map((detail) => ({
  //     message: detail.message,
  //     path: detail.path,
  //     type: detail.type,
  //   }));
  //   return res.status(400).json({ errors });
  // }

  req.body.accountId = req.user?.id!;

  next();
};
