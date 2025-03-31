import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateFunnelKanbanTicketForSelectBodyDTO_I,
  UpdateFunnelKanbanTicketForSelectParamsDTO_I,
} from "./DTO";

export const updateFunnelKanbanTicketForSelectValidation = (
  req: Request<
    UpdateFunnelKanbanTicketForSelectParamsDTO_I,
    any,
    UpdateFunnelKanbanTicketForSelectBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    columnId: Joi.number().required(),
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

  req.params.columnId = Number(req.params.columnId);
  req.params.ticketId = Number(req.params.ticketId);

  next();
};
