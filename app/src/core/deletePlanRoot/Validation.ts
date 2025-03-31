import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { DeletePlanDTO_I } from "./DTO";

export const deletePlanRootValidation = (
  req: Request<DeletePlanDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    params: Joi.object({ id: Joi.number().required() }),
    body: Joi.object({ rootId: Joi.number().required() }),
  });

  const validation = schemaValidation.validate(req, { abortEarly: false });

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
