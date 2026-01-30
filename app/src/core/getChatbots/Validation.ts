import { NextFunction, Request, Response } from "express";
import { GetChabotsBodyDTO_I, GetChabotsQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getChabotsValidation = (
  req: Request<any, any, GetChabotsBodyDTO_I, GetChabotsQueryDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    type: Joi.string()
      .regex(/^(link|message|qrcode)+(-(link|message|qrcode)+)*$/)
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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
  req.body.accountId = req.user?.id!;

  next();
};
