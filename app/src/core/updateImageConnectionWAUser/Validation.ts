import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateImageConnectionUserBodyDTO_I,
  CreateImageConnectionUserParamsDTO_I,
} from "./DTO";

export const createImageConnectionUserValidation = (
  req: Request<
    CreateImageConnectionUserParamsDTO_I,
    any,
    CreateImageConnectionUserBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  console.log("AQUI 1");

  const schemaValidation = Joi.object({
    fileName: Joi.string().required(),
    accountId: Joi.number().optional(),
    id: Joi.number().optional(),
  });
  console.log("AQUI 2");
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
  console.log("AQUI 3");
  req.params.id = Number(req.params.id);
  console.log("AQUI 4");
  next();
};
