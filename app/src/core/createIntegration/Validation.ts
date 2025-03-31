import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateIntegrationDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createIntegrationValidation = (
  req: Request<any, any, CreateIntegrationDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    key: Joi.string().optional(),
    subUserUid: Joi.string().optional(),
    type: Joi.string()
      .regex(/^(trello)$/)
      .required(),
    token: Joi.string().optional(),
    name: Joi.string().required(),
  } as { [x in keyof CreateIntegrationDTO_I]: any });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  if (req.body.type === "trello" && (!req.body.token || !req.body.key)) {
    throw new ErrorResponse(400)
      .input({
        path: "key",
        text: `Chave de API é obrigatória`,
      })
      .input({
        path: "token",
        text: `Token é obrigatório`,
      });
  }

  next();
};
