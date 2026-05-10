import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateTemplateDTO_I } from "./DTO";

export const createTemplateValidation = (
  req: Request<any, any, CreateTemplateDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const valueSchema = Joi.alternatives().try(
    Joi.number(),
    Joi.string(),
    Joi.array().items(Joi.number()),
    Joi.array().items(Joi.string()),
  );

  const schemaValidation = Joi.object({
    modalHash: Joi.string().required(),

    templatedId: Joi.number().required(),
    fields: Joi.object()
      .pattern(
        Joi.string(), // chave externa dinâmica
        Joi.object().pattern(
          Joi.string(), // chave interna dinâmica
          valueSchema,
        ),
      )
      .required(),
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
  req.body.accountId = req.user?.id!;
  next();
};
