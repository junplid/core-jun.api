import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateCloneChatbotBodyDTO_I,
  CreateCloneChatbotParamsDTO_I,
} from "./DTO";

export const createCloneChatbotValidation = (
  req: Request<CreateCloneChatbotParamsDTO_I, any, CreateCloneChatbotBodyDTO_I>,
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
