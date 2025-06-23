import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { TestFbPixelDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const testFbPixelValidation = (
  req: Request<any, any, TestFbPixelDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    pixel_id: Joi.string().required(),
    access_token: Joi.string().required(),
    test_event_code: Joi.string().optional(),
    accountId: Joi.number().required(),
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
