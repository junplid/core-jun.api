import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteVariableContactHumanServiceBodyDTO_I,
  DeleteVariableContactHumanServiceParamsDTO_I,
} from "./DTO";

export const deleteVariableContactHumanServiceValidation = (
  req: Request<
    DeleteVariableContactHumanServiceParamsDTO_I,
    any,
    DeleteVariableContactHumanServiceBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    ticketId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false }
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail: any) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = Number(req.params.id);
  req.params.ticketId = Number(req.params.ticketId);

  next();
};
