import { Request, Response } from "express";
import {
  GetTagForSelectBodyDTO_I,
  GetTagForSelectParamsDTO_I,
  GetTagForSelectQueryDTO_I,
} from "./DTO";
import { GetTagForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTagForSelectController = (useCase: GetTagForSelectUseCase) => {
  const execute = async (
    req: Request<
      GetTagForSelectParamsDTO_I,
      any,
      GetTagForSelectBodyDTO_I,
      GetTagForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
        ...req.params,
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
