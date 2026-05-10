import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateTemplate_root_BodyDTO_I,
  UpdateTemplate_root_ParamsDTO_I,
} from "./DTO";

export const updateTemplate_root_Validation = (
  req: Request<
    UpdateTemplate_root_ParamsDTO_I,
    any,
    UpdateTemplate_root_BodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().optional(),
    card_desc: Joi.string().optional(),
    type: Joi.string().optional(),
    markdown_desc: Joi.string().optional(),
    script_runner: Joi.string().optional(),

    sections: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          title: Joi.string().required(),
          collapsible: Joi.boolean().optional(),
          desc: Joi.string().optional().allow(""),

          inputs: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                label: Joi.string().required(),
                type: Joi.string()
                  .valid("number", "text", "select", "textarea", "tags-input")
                  .required(),
                placeholder: Joi.string().optional().allow(""),
                defaultValue: Joi.string().optional().allow(""),
                helperText: Joi.string().optional().allow(""),
                required: Joi.boolean().optional(),
                min: Joi.number().optional().allow(""),
                max: Joi.number().optional().allow(""),
                isSearchable: Joi.boolean().optional().allow(""),
                isMulti: Joi.boolean().optional().allow(""),
                isClearable: Joi.boolean().optional().allow(""),
                options: Joi.array().items(Joi.string()).optional(),
              }),
            )
            .required(),
        }),
      )
      .optional(),

    chat_demo: Joi.string().optional(),
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

  ((req.params.id = validation.value.id), next());
};
