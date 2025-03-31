import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateDataFlowBodyDTO_I, UpdateDataFlowParamsDTO_I } from "./DTO";

export const updateDataFlowValidation = (
  req: Request<UpdateDataFlowParamsDTO_I, any, UpdateDataFlowBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    id: Joi.number().required(),
    data: Joi.object({
      edges: Joi.array().items(Joi.any()).required(),
      nodes: Joi.array()
        .items(
          Joi.object({
            selectable: Joi.boolean().optional(),
            id: Joi.string().required(),
            type: Joi.string().required(),
            position: Joi.object({
              x: Joi.number().required(),
              y: Joi.number().required(),
            }),
            positionAbsolute: Joi.object({
              x: Joi.number().required(),
              y: Joi.number().required(),
            }),
            data: Joi.any().optional(),
            selected: Joi.boolean().optional(),
            dragging: Joi.boolean().optional(),
            height: Joi.number().optional(),
            width: Joi.number().optional(),
          })
        )
        .required(),
    }).required(),
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
