import { Request, Response } from "express";
import {
  GetVariablesForSelectHumanServiceBodyDTO_I,
  GetVariablesForSelectHumanServiceQueryDTO_I,
} from "./DTO";
import { GetVariablesForSelectHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetVariablesForSelectHumanServiceController = (
  useCase: GetVariablesForSelectHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetVariablesForSelectHumanServiceBodyDTO_I,
      GetVariablesForSelectHumanServiceQueryDTO_I
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
