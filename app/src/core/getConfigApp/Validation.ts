import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetConfigAppDTO_I } from "./DTO";

export const getConfigAppValidation = (
  req: Request<any, any, GetConfigAppDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body, ...req.query, ...req.params };
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(data, { abortEarly: false });

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
