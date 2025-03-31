import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { CreateNewTicketDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createNewTicketValidation = (
  req: Request<any, any, CreateNewTicketDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    connectionId: Joi.number().required(),
    columnId: Joi.number().required(),
    number: Joi.string().required(),
    text: Joi.string().required(),
    name: Joi.string().min(1).required(),
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

  const number = validatePhoneNumber(req.body.number, { removeNine: true });

  if (!number) {
    throw new ErrorResponse(400).input({
      path: "number",
      text: `Número de whatsapp inválido.`,
    });
  } else {
    req.body.completeNumber = number;
  }

  next();
};
