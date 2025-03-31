import { Request, Response } from "express";
import {
  GetDocumentContactAccountFileBodyDTO_I,
  GetDocumentContactAccountFileDTO_I,
  GetDocumentContactAccountFileParamsDTO_I,
} from "./DTO";
import { GetDocumentContactAccountFileUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetDocumentContactAccountFileController = (
  useCase: GetDocumentContactAccountFileUseCase
) => {
  const execute = async (
    req: Request<
      GetDocumentContactAccountFileParamsDTO_I,
      any,
      GetDocumentContactAccountFileBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
