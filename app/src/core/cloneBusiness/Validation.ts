import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateCloneBusinessBodyDTO_I,
  CreateCloneBusinessParamsDTO_I,
} from "./DTO";

export const createCloneBusinessValidation = (
  req: Request<
    CreateCloneBusinessParamsDTO_I,
    any,
    CreateCloneBusinessBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    flow: Joi.bool().optional(),
    attendants: Joi.bool().optional(),
    kanban: Joi.bool().optional(),
    sector: Joi.bool().optional(),
    connection: Joi.bool().optional(),
    audience: Joi.bool().optional(),
    receptiveService: Joi.bool().optional(),
    campaignParameter: Joi.bool().optional(),
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

  req.params.id = Number(req.params.id);

  next();
};
