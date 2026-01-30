import { NextFunction, Request, Response } from "express";
import {
  GetTicketCountBodyDTO_I,
  GetTicketCountParamsDTO_I,
  GetTicketCountQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getTicketCountValidation = (
  req: Request<
    GetTicketCountParamsDTO_I,
    any,
    GetTicketCountBodyDTO_I,
    GetTicketCountQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().optional(),
    id: Joi.number().required(),
    type: Joi.string().valid("NEW", "OPEN", "RESOLVED").optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
    { abortEarly: false },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = Number(req.params.id);
  req.body.accountId = req.user?.id!;
  next();
};
