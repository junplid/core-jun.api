import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateVariableContactHumanServiceDTO_I } from "./DTO";

export const updateVariableContactHumanServiceValidation = (
  req: Request<any, any, UpdateVariableContactHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    value: Joi.string().allow(""),
    userId: Joi.number().required(),
    ticketId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail: any) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  next();
};
