import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import json5 from "json5";
import phone from "libphonenumber-js";
import removeAccents from "remove-accents";
import {
  CreateInsertLeadOnDemandAudienceBodyDTO_I,
  CreateInsertLeadOnDemandAudienceDTO_I,
  CreateInsertLeadOnDemandAudienceQueryDTO_I,
} from "./DTO";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { ErrorResponse } from "../../utils/ErrorResponse";

const keysFilterStatic = {
  phone: [
    "numero",
    "número",
    "phone",
    "telefone",
    "celular",
    "whatsapp",
    "zap",
  ],
  name: ["name", "nome"],
  tag: [
    "etiqueta",
    "etiquetas",
    "categoria",
    "categorias",
    "grupo",
    "tag",
    "tags",
  ],
};

interface ObjContact {
  name: string;
  number: string;
  tags?: string[];
  variables?: { [x: string]: string };
}

const generateRegex = (it: string[]) => new RegExp(`^(${it.join("|")})$`, "i");

interface DraftPhone {
  completeNumber: string;
}

export const createInsertLeadOnDemandAudienceValidation = async (
  req: Request<
    any,
    any,
    CreateInsertLeadOnDemandAudienceBodyDTO_I,
    Omit<CreateInsertLeadOnDemandAudienceQueryDTO_I, "variables">
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    number: Joi.string().required(),
    id: Joi.string().required(),
    tags: Joi.string()
      .regex(/^.+(-.+)*$/)
      .optional(),
  });
  const { accountId, ...restBody } = req.body;
  const { name, number, id, tags, ...restQuery } = req.query;
  const data = { ...restBody, ...restQuery };

  const validation = schemaValidation.validate(
    { accountId, name, id, number, tags },
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

  const draft: ObjContact = {
    tags: [],
    variables: {},
  } as unknown as ObjContact;

  for await (const [key, vl] of Object.entries(data)) {
    const newKey = removeAccents(key);
    const value = vl as string;
    if (generateRegex(keysFilterStatic.name).test(newKey)) {
      draft.name = value as string;
    }
    if (!generateRegex(keysFilterStatic.tag).test(newKey)) {
      Object.assign(draft.variables ?? {}, { [key]: value });
    }
    if (generateRegex(keysFilterStatic.tag).test(newKey)) {
      const isTagList = /\[.+\]/.test(value);
      if (isTagList) {
        draft.tags = json5.parse(value);
      }
      draft.tags = [value];
    }
  }

  const numberValid = validatePhoneNumber(number, { removeNine: true });

  if (!numberValid) {
    throw new ErrorResponse(400).input({
      path: "number",
      text: `Número inválido: ${number}`,
    });
  }

  req.body = { ...draft, accountId };
  req.query.number = numberValid;
  req.query.id = Number(id);

  next();
};
