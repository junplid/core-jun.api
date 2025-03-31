import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteDocumentContactAccountFileBodyDTO_I,
  DeleteDocumentContactAccountFileParamsDTO_I,
} from "./DTO";

export const deleteDocumentContactAccountFileValidation = (
  req: Request<
    DeleteDocumentContactAccountFileParamsDTO_I,
    any,
    DeleteDocumentContactAccountFileBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
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
