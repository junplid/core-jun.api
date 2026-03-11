import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateMenuOnlineBodyDTO_I, UpdateMenuOnlineParamsDTO_I } from "./DTO";

export const updateMenuOnlineValidation = (
  req: Request<UpdateMenuOnlineParamsDTO_I, any, UpdateMenuOnlineBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    identifier: Joi.string().required(),
    desc: Joi.string().optional().allow("", null),
    fileNameImage: Joi.string().optional().allow("", null),
    bg_primary: Joi.custom((value) => {
      if (value === "null") return null;
      return value;
    }),
    bg_secondary: Joi.custom((value) => {
      if (value === "null") return null;
      return value;
    }),
    bg_tertiary: Joi.string()
      .optional()
      .allow("", null)
      .custom((value) => {
        if (value === "null") return null;
        return value;
      }),
    bg_capa: Joi.custom((value) => {
      if (value === "null") return null;
      return value;
    }),
    titlePage: Joi.string().optional().allow("", null),
    connectionWAId: Joi.custom((value) => {
      if (value === "null") return null;
      return Number(value);
    }),
  });

  const validation = schemaValidation.validate(
    {
      ...req.body,
      ...req.params,
      fileNameImage: req.file?.filename,
      ...req.query,
    },
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

  req.params.id = Number(req.params.id);
  req.body.fileNameImage = req.file?.filename;
  req.body.accountId = req.user?.id!;
  req.body = { ...req.body, ...validation.value };
  next();
};
