import { NextFunction, Request, Response } from "express";
import { CreateTableItemBodyDTO_I, CreateTableItemParamsDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const createTableItemValidation = (
  req: Request<CreateTableItemParamsDTO_I, any, CreateTableItemBodyDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    tableId: Joi.number().required(),
    items: Joi.array().items(
      Joi.object({
        qnt: Joi.number().required(),
        obs: Joi.string().max(130).allow(""),
        uuid: Joi.string().required(),
        sections: Joi.object()
          .pattern(
            Joi.string(),
            Joi.object().pattern(Joi.string(), Joi.number().integer().min(0)),
          )
          .optional(),
      }),
    ),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false, convert: true },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return _res.status(400).json({ errors });
  }

  req.body.accountId = req.user?.id!;
  req.params.tableId = validation.value.tableId;
  next();
};
