import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateFunnelKanbanTicketBodyDTO_I,
  UpdateFunnelKanbanTicketParamsDTO_I,
} from "./DTO";

export const updateFunnelKanbanTicketValidation = (
  req: Request<
    UpdateFunnelKanbanTicketParamsDTO_I,
    any,
    UpdateFunnelKanbanTicketBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    kanbanId: Joi.number().required(),
    columns: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        rows: Joi.array().items(
          Joi.object({
            delete: Joi.boolean(),
            newSequence: Joi.number().required(),
            ticketId: Joi.number().required(),
          })
        ),
      })
    ),
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

  req.params.kanbanId = Number(req.params.kanbanId);

  next();
};
