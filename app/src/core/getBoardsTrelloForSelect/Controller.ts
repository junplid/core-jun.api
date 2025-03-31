import { Request, Response } from "express";
import {
  GetBoardsTrelloForSelectDTO_I,
  GetBoardsTrelloForSelectParamsDTO_I,
  GetBoardsTrelloForSelectQueryDTO_I,
} from "./DTO";
import { GetBoardsTrelloForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetBoardsTrelloForSelectController = (
  useCase: GetBoardsTrelloForSelectUseCase
) => {
  const execute = async (
    req: Request<
      GetBoardsTrelloForSelectParamsDTO_I,
      any,
      GetBoardsTrelloForSelectDTO_I,
      GetBoardsTrelloForSelectQueryDTO_I
    >,
    res: Response
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
