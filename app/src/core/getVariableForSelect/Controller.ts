import { Request, Response } from "express";
import {
  GetVariableForSelectBodyDTO_I,
  GetVariableForSelectParamsDTO_I,
  GetVariableForSelectQueryDTO_I,
} from "./DTO";
import { GetVariableForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetVariableForSelectController = (
  useCase: GetVariableForSelectUseCase
) => {
  const execute = async (
    req: Request<
      GetVariableForSelectParamsDTO_I,
      any,
      GetVariableForSelectBodyDTO_I,
      GetVariableForSelectQueryDTO_I
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
