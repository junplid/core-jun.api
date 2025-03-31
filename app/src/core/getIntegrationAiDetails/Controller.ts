import { Request, Response } from "express";
import {
  GetIntegrationAiDetailsBodyDTO_I,
  GetIntegrationAiDetailsParamsDTO_I,
} from "./DTO";
import { GetIntegrationAiDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetIntegrationAiDetailsController = (
  useCase: GetIntegrationAiDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetIntegrationAiDetailsParamsDTO_I,
      GetIntegrationAiDetailsBodyDTO_I
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
