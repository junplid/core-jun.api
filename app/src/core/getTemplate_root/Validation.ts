import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetTemplate_root_ParamsDTO_I } from "./DTO";

export const getTemplate_root_Validation = (
  req: Request<GetTemplate_root_ParamsDTO_I, any, any>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
  });
  const validation = schemaValidation.validate(req.params, {
    abortEarly: false,
  });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = validation.value.id;

  next();
};
