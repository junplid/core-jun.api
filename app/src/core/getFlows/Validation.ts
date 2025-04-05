import { NextFunction, Request, Response } from "express";
import { GetFlowsBodyDTO_I, GetFlowsQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getFlowsValidation = (
  req: Request<any, any, GetFlowsBodyDTO_I, GetFlowsQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    page: Joi.number().optional(),
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

  if (req.query.page) req.query.page = Number(req.query.page);

  next();
};
