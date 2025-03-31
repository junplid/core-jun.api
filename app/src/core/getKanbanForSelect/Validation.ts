import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetKanbanForSelectBodyDTO_I,
  GetKanbanForSelectParamsDTO_I,
} from "./DTO";

export const getKanbanForSelectValidation = (
  req: Request<GetKanbanForSelectParamsDTO_I, any, GetKanbanForSelectBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    ticketId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  if (req.params.ticketId) {
    req.params.ticketId = Number(req.params.ticketId);
  }

  next();
};
