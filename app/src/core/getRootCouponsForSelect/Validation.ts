import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetRootCouponsForSelectDTO_I } from "./DTO";

export const getRootCouponsForSelectValidation = (
  req: Request<any, any, GetRootCouponsForSelectDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  next();
};
