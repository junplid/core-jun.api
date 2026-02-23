import { Request, Response } from "express";
import {
  GetAgentTemplateBodyDTO_I,
  GetAgentTemplateParamsDTO_I,
  GetAgentTemplateQueryDTO_I,
} from "./DTO";
import { GetAgentTemplateUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetAgentTemplateController = (
  useCase: GetAgentTemplateUseCase,
) => {
  const execute = async (
    req: Request<
      GetAgentTemplateParamsDTO_I,
      any,
      GetAgentTemplateBodyDTO_I,
      GetAgentTemplateQueryDTO_I
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
