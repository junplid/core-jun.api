import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetStaticFileBodyDTO_I, GetStaticFileQueryDTO_I } from "./DTO";

export const getStaticFileValidation = (
  req: Request<any, any, GetStaticFileBodyDTO_I, GetStaticFileQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    type: Joi.string().regex(/(video|image|pdf|file|audio)/),
    accountId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  next();
};
