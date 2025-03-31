import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateTransferTicketDTO_I } from "./DTO";

export const createTransferTicketValidation = (
  req: Request<any, any, CreateTransferTicketDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    ticketId: Joi.number().required(),
    sectorId: Joi.number().required(),
    attendantId: Joi.number().optional(),
    columnId: Joi.number().optional(),
    type: Joi.string().valid("attendant", "sector").required(),
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
