import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateGeolocationBusinessDTO_I } from "./DTO";

export const createGeolocationBusinessValidation = (
  req: Request<any, any, CreateGeolocationBusinessDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    address: Joi.string(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

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
