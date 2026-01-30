import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateBusinessOnAccountBodyDTO_I,
  UpdateBusinessOnAccountParamsDTO_I,
  UpdateBusinessOnAccountQueryDTO_I,
} from "./DTO";

export const updateBusinessOnAccountValidation = (
  req: Request<
    UpdateBusinessOnAccountParamsDTO_I,
    any,
    UpdateBusinessOnAccountBodyDTO_I,
    UpdateBusinessOnAccountQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().messages({
      "string.empty": "Campo não pode ser vazio",
    }),
    description: Joi.string().allow(""),
    subUserUid: Joi.string().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
    { abortEarly: false },
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
  req.body.accountId = req.user?.id!;
  next();
};
