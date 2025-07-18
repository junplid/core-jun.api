import { Request, Response } from "express";
import {
  DeleteTrelloIntegrationBodyDTO_I,
  DeleteTrelloIntegrationParamsDTO_I,
} from "./DTO";
import { DeleteTrelloIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteTrelloIntegrationController = (
  useCase: DeleteTrelloIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      DeleteTrelloIntegrationParamsDTO_I,
      any,
      DeleteTrelloIntegrationBodyDTO_I
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
