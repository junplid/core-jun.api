import { NextFunction, Request, Response } from "express";
import {
  GetAgentTemplateBodyDTO_I,
  GetAgentTemplateParamsDTO_I,
  GetAgentTemplateQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getAgentTemplateValidation = (
  req: Request<
    GetAgentTemplateParamsDTO_I,
    any,
    GetAgentTemplateBodyDTO_I,
    GetAgentTemplateQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number(),
    fields: Joi.string()
      .default("title,created_by,markdown_desc,createAt,updateAt")
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.params, ...req.query },
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
  req.params.id = validation.value.id;
  req.query.fields = validation.value.fields;

  next();
};
