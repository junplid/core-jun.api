import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateAgentTemplateDTO_I } from "./DTO";

export const createAgentTemplateValidation = (
  req: Request<any, any, CreateAgentTemplateDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    title: Joi.string().required(),
    card_desc: Joi.string().required(),
    markdown_desc: Joi.string().required(),
    config_flow: Joi.string().required(),
    script_runner: Joi.string().required(),
    script_build_agentai_for_test: Joi.string().required(),

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
                  .valid(
                    "number",
                    "text",
                    "select",
                    "select_variables",
                    "select_variable",
                    "textarea",
                  )
                  .required(),
                placeholder: Joi.string().optional().allow(""),
                defaultValue: Joi.string().optional().allow(""),
                helperText: Joi.string().optional().allow(""),
                required: Joi.boolean().optional(),
              }),
            )
            .required(),
        }),
      )
      .required(),

    chat_demo: Joi.string().required(),
    variables: Joi.array().items(Joi.string()).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
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

  next();
};
