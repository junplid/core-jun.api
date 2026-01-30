import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetAccountDTO_I } from "./DTO";

export const getAccountValidation = (
  req: Request<any, any, GetAccountDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  req.body.accountId = req.user?.id!;

  next();
};
