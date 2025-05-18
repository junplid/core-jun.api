import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateAccountDTO_I } from "./DTO";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const updateAccountValidation = (
  req: Request<any, any, UpdateAccountDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string(),
    number: Joi.string(),
    email: Joi.string().email().optional(),
    onboarded: Joi.boolean(),
    currentPassword: Joi.string().optional(),
    nextPassword: Joi.string().optional(),
  }).and("currentPassword", "nextPassword");

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  const { number: numberBody, ...rest } = validation.value;

  if (numberBody) {
    const number = validatePhoneNumber(numberBody, { removeNine: true });

    const { statusCode, ...err } = new ErrorResponse(400)
      .input({
        text: `Número whatsapp inválido`,
        path: "number",
      })
      .getResponse();

    if (!number) {
      return res.status(statusCode).json(err);
    }

    req.body = { ...rest, number };
  }

  req.body = rest;

  next();
};
