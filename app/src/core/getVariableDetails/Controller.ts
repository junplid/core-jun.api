import { Request, Response } from "express";
import {
  GetVariableDetailsBodyDTO_I,
  GetVariableDetailsParamsDTO_I,
} from "./DTO";
import { GetVariableDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetVariableDetailsController = (
  useCase: GetVariableDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetVariableDetailsParamsDTO_I,
      any,
      GetVariableDetailsBodyDTO_I
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
