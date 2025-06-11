import { Request, Response } from "express";
import {
  GetProvidersForSelectBodyDTO_I,
  GetProvidersForSelectQueryDTO_I,
} from "./DTO";
import { GetProvidersForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetProvidersForSelectController = (
  useCase: GetProvidersForSelectUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetProvidersForSelectBodyDTO_I,
      GetProvidersForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
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
