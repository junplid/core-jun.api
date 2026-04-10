import { NextFunction, Request, Response } from "express";
import {
  CollectRouteOrderBodyDTO_I,
  CollectRouteOrderParamsDTO_I,
  CollectRouteOrderQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const collectRouteOrderValidation = (
  req: Request<
    CollectRouteOrderParamsDTO_I,
    any,
    CollectRouteOrderBodyDTO_I,
    CollectRouteOrderQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    code: Joi.string().required(),
    n_order: Joi.string().required(),
    nlid: Joi.string().required(),
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

  next();
};
