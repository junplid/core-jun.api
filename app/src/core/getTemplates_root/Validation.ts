import { NextFunction, Request, Response } from "express";
// import { Joi } from "express-validation";
import { GetTemplates_root_DTO_I } from "./DTO";

export const getTemplates_root_Validation = (
  req: Request<any, any, GetTemplates_root_DTO_I>,
  res: Response,
  next: NextFunction,
) => {
  // const schemaValidation = Joi.object({});
  // const validation = schemaValidation.validate(req.body, { abortEarly: false });

  // if (validation.error) {
  //   const errors = validation.error.details.map((detail) => ({
  //     message: detail.message,
  //     path: detail.path,
  //     type: detail.type,
  //   }));
  //   return res.status(400).json({ errors });
  // }

  next();
};
