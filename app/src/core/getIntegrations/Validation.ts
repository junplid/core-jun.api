import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetIntegrationsDTO_I } from "./DTO";

export const getIntegrationsValidation = (
  req: Request<any, any, GetIntegrationsDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
  });
  console.log("Passou aqui1");

  const validation = schemaValidation.validate(
    { ...req.body },
    { abortEarly: false }
  );
  console.log("Passou aqui2");

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  console.log("Passou aqui");

  next();
};
