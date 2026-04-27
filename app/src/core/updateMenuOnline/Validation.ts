import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateMenuOnlineBodyDTO_I, UpdateMenuOnlineParamsDTO_I } from "./DTO";

type MulterFiles = {
  fileImage?: Express.Multer.File[];
  fileCapaImage?: Express.Multer.File[];
};

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
    fileNameCapaImage: Joi.string().optional().allow("", null),
    is_accepting_motoboys: Joi.boolean().optional(),
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
    connectionWAId: Joi.number().required(),
  });

  const files = req.files as MulterFiles;
  const fileNameImage = files.fileImage?.[0]?.filename;
  const fileNameCapaImage = files.fileCapaImage?.[0]?.filename;

  const validation = schemaValidation.validate(
    {
      ...req.body,
      ...req.params,
      fileNameImage,
      fileNameCapaImage,
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
  req.body.accountId = req.user?.id!;
  req.body = { ...req.body, ...validation.value };
  next();
};
