import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GeKanbanForSelectBodyDTO_I, GeKanbanForSelectQueryDTO_I } from "./DTO";

export const geKanbanForSelectValidation = (
  req: Request<
    any,
    any,
    GeKanbanForSelectBodyDTO_I,
    GeKanbanForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    businessIds: Joi.string().optional(),
    accountId: Joi.number().required(),
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

  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((e) => Number(e));
  }

  next();
};
