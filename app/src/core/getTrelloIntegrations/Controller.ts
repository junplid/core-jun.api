import { Request, Response } from "express";
import {
  GetTrelloIntegrationsBodyDTO_I,
  GetTrelloIntegrationsQueryDTO_I,
} from "./DTO";
import { GetTrelloIntegrationsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTrelloIntegrationsController = (
  useCase: GetTrelloIntegrationsUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetTrelloIntegrationsBodyDTO_I,
      GetTrelloIntegrationsQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.query });
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
