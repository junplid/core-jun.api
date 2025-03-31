import { NextFunction, Request, Response } from "express";
import { LoginHumanServiceDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const loginHumanServiceValidation = (
  req: Request<any, any, LoginHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    username: Joi.string().required(),
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
