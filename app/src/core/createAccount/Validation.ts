import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { CreateAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createAccountValidation = (
  req: Request<any, any, CreateAccountDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    cpfCnpj: Joi.string(),
    password: Joi.string().required(),
    number: Joi.string().required(),
    affiliate: Joi.string().optional(),
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

  const number = validatePhoneNumber(req.body.number);

  if (!number) {
    const { statusCode, ...resp } = new ErrorResponse(400)
      .input({
        path: "number",
        text: "Número de Whatsapp inválido.",
      })
      .getResponse();

    return res.status(statusCode).json(resp);
  }

  req.body = { ...req.body, number };

  next();
};
