import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateMenuOnlineBodyDTO_I, UpdateMenuOnlineParamsDTO_I } from "./DTO";

export const updateMenuOnlineValidation = (
  req: Request<UpdateMenuOnlineParamsDTO_I, any, UpdateMenuOnlineBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    identifier: Joi.string().optional(),
    desc: Joi.string().allow(""),
    fileNameImage: Joi.string().allow(""),
    bg_primary: Joi.string().allow(""),
    bg_secondary: Joi.string().allow(""),
    bg_tertiary: Joi.string().allow(""),
    label1: Joi.string().allow(""),
    label: Joi.string().allow(""),
    titlePage: Joi.string().allow(""),
    status: Joi.boolean(),
  });

  const validation = schemaValidation.validate(
    {
      ...req.body,
      ...req.params,
      fileNameImage: req.file?.filename,
      ...req.query,
    },
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
  req.body.fileNameImage = req.file?.filename;

  next();
};
