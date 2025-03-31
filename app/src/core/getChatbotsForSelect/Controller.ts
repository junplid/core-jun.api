import { Request, Response } from "express";
import {
  GetChabotsForSelectBodyDTO_I,
  GetChabotsForSelectQueryDTO_I,
} from "./DTO";
import { GetChabotsForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetChabotsForSelectController = (
  useCase: GetChabotsForSelectUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetChabotsForSelectBodyDTO_I,
      GetChabotsForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.query });
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
