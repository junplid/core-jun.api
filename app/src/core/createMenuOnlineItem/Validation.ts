import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateMenuOnlineItemBodyDTO_I,
  CreateMenuOnlineItemParamsDTO_I,
} from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createMenuOnlineItemValidation = (
  req: Request<
    CreateMenuOnlineItemParamsDTO_I,
    any,
    CreateMenuOnlineItemBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    uuid: Joi.string().required(),
    category: Joi.valid("pizzas", "drinks").required(),
    desc: Joi.string().allow(""),
    beforePrice: Joi.number(),
    afterPrice: Joi.number(),
    fileNameImage: Joi.string().required(),
    qnt: Joi.number().min(0),
  });

  const validation = schemaValidation.validate(
    { ...req.body, fileNameImage: req.file?.filename, ...req.params },
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

  if (req.body.category === "drinks" && !req.body.afterPrice) {
    throw new ErrorResponse(400).input({
      path: "afterPrice",
      text: "Campo obrigatório.",
    });
  }

  req.body.qnt = validation.value.qnt;
  req.body.beforePrice = validation.value.beforePrice;
  req.body.afterPrice = validation.value.afterPrice;
  req.body.fileNameImage = req.file!.filename;
  req.body.accountId = req.user?.id!;
  next();
};
