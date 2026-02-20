import { NextFunction, Request, Response } from "express";
import { GetSubscriptionDTO_I } from "./DTO";

export const getSubscriptionValidation = (
  req: Request<any, any, GetSubscriptionDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  req.body.accountId = req.user?.id!;

  next();
};
