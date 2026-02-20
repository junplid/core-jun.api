import { NextFunction, Request, Response } from "express";
import { CreateSetupIntents_StripeDTO_I } from "./DTO";

export const createSetupIntents_StripeValidation = (
  req: Request<any, any, CreateSetupIntents_StripeDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  req.body = { accountId: req.user?.id! };

  next();
};
