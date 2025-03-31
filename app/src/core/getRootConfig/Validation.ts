import { NextFunction, Request, Response } from "express";
import { GetRootConfigBodyDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getRootConfigValidation = (
  req: Request<any, any, GetRootConfigBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  next();
};
