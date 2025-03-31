import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateKanbanDTO_I } from "./DTO";

export const createKanbanValidation = (
  req: Request<any, any, CreateKanbanDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    businessId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    columns: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        color: Joi.string().required(),
        sequence: Joi.number().required(),
      })
    ),
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

  next();
};
