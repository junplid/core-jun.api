import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateDataFlowBodyDTO_I, UpdateDataFlowParamsDTO_I } from "./DTO";

export const updateDataFlowValidation = (
  req: Request<UpdateDataFlowParamsDTO_I, any, UpdateDataFlowBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.string().required(),
    nodes: Joi.array()
      .items(
        Joi.object({
          type: Joi.valid("upset", "delete"),
          node: Joi.object(),
        }),
      )
      .optional(),
    edges: Joi.array()
      .items(
        Joi.object({
          type: Joi.valid("upset", "delete"),
          edge: Joi.object(),
        }),
      )
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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
