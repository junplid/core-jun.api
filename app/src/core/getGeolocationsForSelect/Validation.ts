import { TypeVariable } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetGeolocationForSelectBodyDTO_I,
  GetGeolocationForSelectQueryDTO_I,
} from "./DTO";

export const getGeolocationForSelectValidation = (
  req: Request<
    any,
    any,
    GetGeolocationForSelectBodyDTO_I,
    GetGeolocationForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().allow(""),
    businessIds: Joi.string().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  if (req.query.businessIds?.length) {
    req.query.businessIds = (req.query.businessIds as unknown as string)
      .split("-")
      .map((b) => Number(b));
  }

  next();
};
