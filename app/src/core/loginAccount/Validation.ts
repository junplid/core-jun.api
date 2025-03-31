import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { LoginAccountDTO_I } from "./DTO";

export const loginAccountValidation = (
  req: Request<any, any, LoginAccountDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Campo é obrigatório.",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Este campo é obrigatório.",
    }),
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
