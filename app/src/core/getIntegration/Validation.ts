import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetIntegrationBodyDTO_I, GetIntegrationParamsDTO_I } from "./DTO";

export const getIntegrationValidation = (
  req: Request<GetIntegrationParamsDTO_I, any, GetIntegrationBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
  });
  console.log("Passou aqui1");

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  req.params.id = Number(req.params.id);

  next();
};
