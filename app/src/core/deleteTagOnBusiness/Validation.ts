import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteTagOnBusinessBodyDTO_I,
  DeleteTagOnBusinessParamsDTO_I,
} from "./DTO";

export const deleteTagOnBusinessValidation = (
  req: Request<
    DeleteTagOnBusinessParamsDTO_I,
    any,
    DeleteTagOnBusinessBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    tagOnBusinessId: Joi.number().required(),
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

  req.params.tagOnBusinessId = Number(req.params.tagOnBusinessId);

  next();
};
