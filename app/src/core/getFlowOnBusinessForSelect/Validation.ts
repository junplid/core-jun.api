import { NextFunction, Request, Response } from "express";
import {
  GetFlowOnBusinessForSelectBodyDTO_I,
  GetFlowOnBusinessForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getFlowOnBusinessForSelectValidation = (
  req: Request<
    any,
    any,
    GetFlowOnBusinessForSelectBodyDTO_I,
    GetFlowOnBusinessForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    businessIds: Joi.string().optional(),
    type: Joi.string()
      .regex(
        /^(marketing|chatbot|universal)(?:-(marketing|chatbot|universal)+)*$/,
      )
      .optional(),
    name: Joi.string().optional(),
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

  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((e) => Number(e));
  }

  if (req.query.type) {
    req.query.type = String(req.query.type).split("-") as (
      | "marketing"
      | "chatbot"
      | "universal"
    )[];
  }
  req.body.accountId = req.user?.id!;

  next();
};
