import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateConnectionIgDTO_I } from "./DTO";

export const createConnectionIgValidation = (
  req: Request<any, any, CreateConnectionIgDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    agentId: Joi.number().optional(),
    businessId: Joi.number().required(),
    description: Joi.string().allow(""),
    ig_id: Joi.string().required(),
    modal_id: Joi.string().required(),
  }).required();

  const validation = schemaValidation.validate(
    { ...req.body },
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

  req.body = validation.value;
  req.body.accountId = req.user?.id!;
  next();
};
