import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteLinkTackingPixelBodyDTO_I,
  DeleteLinkTackingPixelParamsDTO_I,
} from "./DTO";

export const deleteLinkTackingPixelValidation = (
  req: Request<
    DeleteLinkTackingPixelParamsDTO_I,
    any,
    DeleteLinkTackingPixelBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
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
