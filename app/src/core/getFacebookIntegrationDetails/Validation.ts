import { NextFunction, Request, Response } from "express";
import {
  GetFacebookIntegrationDetailsDTO_I,
  GetFacebookIntegrationDetailsParamsDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getFacebookIntegrationDetailsValidation = (
  req: Request<
    GetFacebookIntegrationDetailsParamsDTO_I,
    any,
    GetFacebookIntegrationDetailsDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
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
