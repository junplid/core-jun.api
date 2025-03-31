import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetListOfBoardTrelloForSelectBodyDTO_I,
  GetListOfBoardTrelloForSelectParamsDTO_I,
} from "./DTO";

export const getListOfBoardTrelloForSelectValidation = (
  req: Request<
    GetListOfBoardTrelloForSelectParamsDTO_I,
    any,
    GetListOfBoardTrelloForSelectBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    boardId: Joi.string(),
    integrationId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  req.params.integrationId = Number(req.params.integrationId);

  next();
};
