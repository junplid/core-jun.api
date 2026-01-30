import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateTagBodyDTO_I,
  UpdateTagParamsDTO_I,
  UpdateTagQueryDTO_I,
} from "./DTO";

export const updateTagValidation = (
  req: Request<
    UpdateTagParamsDTO_I,
    any,
    UpdateTagBodyDTO_I,
    UpdateTagQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()),
    name: Joi.string(),
    type: Joi.string().valid("contactwa", "audience"),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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
  if (req.query.businessIds?.length) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }
  req.body.accountId = req.user?.id!;
  next();
};
