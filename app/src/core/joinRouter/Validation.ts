import { NextFunction, Request, Response } from "express";
import {
  JoinRouterBodyDTO_I,
  JoinRouterParamsDTO_I,
  JoinRouterQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const joinRouterValidation = (
  req: Request<
    JoinRouterParamsDTO_I,
    any,
    JoinRouterBodyDTO_I,
    JoinRouterQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    code: Joi.string().required(),
    fsid: Joi.number().required(),
    nl: Joi.string().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
    { abortEarly: false, convert: true },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.query.fsid = validation.value.fsid;

  next();
};
