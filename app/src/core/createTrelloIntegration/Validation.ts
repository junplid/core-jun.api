import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateTrelloIntegrationDTO_I } from "./DTO";

export const createTrelloIntegrationValidation = (
  req: Request<any, any, CreateTrelloIntegrationDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().max(150).required(),
    status: Joi.boolean().optional(),
    token: Joi.string().max(240).required(),
    key: Joi.string().max(240).required(),
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

  req.body = validation.value;
  req.body.accountId = req.user?.id!;

  next();
};
