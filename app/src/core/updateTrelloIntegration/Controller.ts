import { Request, Response } from "express";
import {
  UpdateTrelloIntegrationBodyDTO_I,
  UpdateTrelloIntegrationParamsDTO_I,
} from "./DTO";
import { UpdateTrelloIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateTrelloIntegrationController = (
  useCase: UpdateTrelloIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      UpdateTrelloIntegrationParamsDTO_I,
      any,
      UpdateTrelloIntegrationBodyDTO_I
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
