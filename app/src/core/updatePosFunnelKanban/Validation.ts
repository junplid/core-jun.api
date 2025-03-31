import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdatePosFunnelKanbanBodyDTO_I,
  UpdatePosFunnelKanbanParamsDTO_I,
} from "./DTO";

export const updatePosFunnelKanbanValidation = (
  req: Request<
    UpdatePosFunnelKanbanParamsDTO_I,
    any,
    UpdatePosFunnelKanbanBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    columnId: Joi.number().required(),
    ticketId: Joi.number().required(),
    funnelKanbanId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  if (req.params.funnelKanbanId)
    req.params.funnelKanbanId = Number(req.params.funnelKanbanId);

  next();
};
