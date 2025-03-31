import { NextFunction, Request, Response } from "express";
import {
  UpdateFastMessageHumanServiceBodyDTO_I,
  UpdateFastMessageHumanServiceParamsDTO_I,
  UpdateFastMessageHumanServiceQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const updateFastMessageHumanServiceValidation = (
  req: Request<
    UpdateFastMessageHumanServiceParamsDTO_I,
    any,
    UpdateFastMessageHumanServiceBodyDTO_I,
    UpdateFastMessageHumanServiceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    id: Joi.number().required(),
    value: Joi.string(),
    shortcut: Joi.string(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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
