import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateRootDTO_I } from "./DTO";

export const createRootValidation = (
  req: Request<any, any, CreateRootDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
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
