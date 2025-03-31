import { Request, Response } from "express";
import {
  UpdateIntegrationAiBodyDTO_I,
  UpdateIntegrationAiParamsDTO_I,
  UpdateIntegrationAiQueryDTO_I,
} from "./DTO";
import { UpdateIntegrationAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateIntegrationAiController = (
  useCase: UpdateIntegrationAiUseCase
) => {
  const execute = async (
    req: Request<
      UpdateIntegrationAiParamsDTO_I,
      any,
      UpdateIntegrationAiBodyDTO_I,
      UpdateIntegrationAiQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
      const data = await useCase.run(dto);
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
