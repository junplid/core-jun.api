import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateFbPixelsDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createFbPixelsValidation = (
  req: Request<any, any, CreateFbPixelsDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    pixel_id: Joi.string().required(),
    access_token: Joi.string().required(),
    businessId: Joi.number().optional(),
    status: Joi.boolean().optional(),
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
