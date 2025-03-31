import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetBoardsTrelloForSelectBodyDTO_I,
  GetBoardsTrelloForSelectParamsDTO_I,
  GetBoardsTrelloForSelectQueryDTO_I,
} from "./DTO";

export const getBoardsTrelloForSelectValidation = (
  req: Request<
    GetBoardsTrelloForSelectParamsDTO_I,
    any,
    GetBoardsTrelloForSelectBodyDTO_I,
    GetBoardsTrelloForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    memberId: Joi.string(),
    integrationId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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
