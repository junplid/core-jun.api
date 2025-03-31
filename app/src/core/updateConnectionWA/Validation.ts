import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateConnectionWABodyDTO_I,
  UpdateConnectionWAParamsDTO_I,
  UpdateConnectionWAQueryDTO_I,
} from "./DTO";

export const updateConnectionWAValidation = (
  req: Request<
    UpdateConnectionWAParamsDTO_I,
    any,
    UpdateConnectionWABodyDTO_I,
    UpdateConnectionWAQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().messages({
      "string.empty": "Campo não pode estar vazio",
    }),
    businessId: Joi.number().messages({
      "string.empty": "Campo não pode estar vazio",
    }),
    type: Joi.string()
      .regex(/^(marketing|chatbot)$/)
      .optional(),
    subUserUid: Joi.string().optional(),
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

  req.params.id = Number(req.params.id);
  if (req.query.businessId) req.query.businessId = Number(req.query.businessId);

  next();
};
