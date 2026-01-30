import { NextFunction, Request, Response } from "express";
import {
  GetInboxUserForSelectBodyDTO_I,
  GetInboxUserForSelectQueryDTO_I,
} from "./DTO";

export const getInboxUserForSelectValidation = (
  req: Request<
    any,
    any,
    GetInboxUserForSelectBodyDTO_I,
    GetInboxUserForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  // const schemaValidation = Joi.object({
  //   accountId: Joi.number().required(),
  // });

  // const validation = schemaValidation.validate(
  //   { ...req.body, ...req.query },
  //   { abortEarly: false }
  // );

  // if (validation.error) {
  //   const errors = validation.error.details.map((detail) => ({
  //     message: detail.message,
  //     path: detail.path,
  //     type: detail.type,
  //   }));
  //   return res.status(400).json({ errors });
  // }

  req.body.accountId = req.user?.id!;

  next();
};
