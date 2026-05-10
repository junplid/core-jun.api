import { Request, Response } from "express";
import {
  GetTemplateBodyDTO_I,
  GetTemplateParamsDTO_I,
  GetTemplateQueryDTO_I,
} from "./DTO";
import { GetTemplateUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTemplateController = (useCase: GetTemplateUseCase) => {
  const execute = async (
    req: Request<
      GetTemplateParamsDTO_I,
      any,
      GetTemplateBodyDTO_I,
      GetTemplateQueryDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
        ...req.query,
      });
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
