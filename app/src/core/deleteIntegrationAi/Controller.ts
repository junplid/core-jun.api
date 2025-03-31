import { Request, Response } from "express";
import {
  DeleteIntegrationAiBodyDTO_I,
  DeleteIntegrationAiParamsDTO_I,
} from "./DTO";
import { DeleteIntegrationAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteIntegrationAiController = (
  useCase: DeleteIntegrationAiUseCase
) => {
  const execute = async (
    req: Request<
      DeleteIntegrationAiParamsDTO_I,
      any,
      DeleteIntegrationAiBodyDTO_I
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
