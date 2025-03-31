import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GeKanbanColumnForSelectHumanServiceBodyDTO_I,
  GeKanbanColumnForSelectHumanServiceQueryDTO_I,
} from "./DTO";

export const geKanbanColumnForSelectHumanServiceValidation = (
  req: Request<
    any,
    any,
    GeKanbanColumnForSelectHumanServiceBodyDTO_I,
    GeKanbanColumnForSelectHumanServiceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    sectorId: Joi.number(),
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

  if (req.query.sectorId) req.query.sectorId = Number(req.query.sectorId);

  next();
};
