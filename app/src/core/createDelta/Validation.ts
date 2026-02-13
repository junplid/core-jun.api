import { NextFunction, Request, Response } from "express";
import { CreateDeltaDTO_I } from "./DTO";

export const createDeltaValidation = (
  req: Request<any, any, CreateDeltaDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  req.body.accountId = req.user?.id!;
  next();
};
