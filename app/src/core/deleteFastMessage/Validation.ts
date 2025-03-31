import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteFastMessageBodyDTO_I,
  DeleteFastMessageParamsDTO_I,
} from "./DTO";

export const deleteFastMessageValidation = (
  req: Request<DeleteFastMessageParamsDTO_I, any, DeleteFastMessageBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number(),
    userId: Joi.number(),
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
