import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteStaticFileBodyDTO_I,
  DeleteStaticFileParamsDTO_I,
  DeleteStaticFileQueryDTO_I,
} from "./DTO";

export const deleteStaticFileValidation = (
  req: Request<
    DeleteStaticFileParamsDTO_I,
    any,
    DeleteStaticFileBodyDTO_I,
    DeleteStaticFileQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    attendantAIId: Joi.number().optional(),
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

  if (req.query.attendantAIId) {
    req.query.attendantAIId = Number(req.query.attendantAIId);
  }

  next();
};
