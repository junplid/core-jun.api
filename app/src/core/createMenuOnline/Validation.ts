import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateMenuOnlineDTO_I } from "./DTO";

export const createMenuOnlineValidation = (
  req: Request<any, any, CreateMenuOnlineDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    identifier: Joi.string().required(),
    desc: Joi.string().allow(""),
    accountId: Joi.number().required(),
    fileNameImage: Joi.string().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, fileNameImage: req.file?.filename },
    { abortEarly: false }
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.body.fileNameImage = req.file!.filename;

  next();
};
