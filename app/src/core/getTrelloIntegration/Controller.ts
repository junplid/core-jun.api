import { Request, Response } from "express";
import {
  GetTrelloIntegrationBodyDTO_I,
  GetTrelloIntegrationParamsDTO_I,
} from "./DTO";
import { GetTrelloIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTrelloIntegrationController = (
  useCase: GetTrelloIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      GetTrelloIntegrationParamsDTO_I,
      any,
      GetTrelloIntegrationBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params });
      return res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
