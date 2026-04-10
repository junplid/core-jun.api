import { NextFunction, Request, Response } from "express";
import {
  DeliveryCodeRouteOrderBodyDTO_I,
  DeliveryCodeRouteOrderParamsDTO_I,
  DeliveryCodeRouteOrderQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const deliveryCodeRouteOrderValidation = (
  req: Request<
    DeliveryCodeRouteOrderParamsDTO_I,
    any,
    DeliveryCodeRouteOrderBodyDTO_I,
    DeliveryCodeRouteOrderQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    code: Joi.string().required(),
    delivery_code: Joi.string().required(),
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
