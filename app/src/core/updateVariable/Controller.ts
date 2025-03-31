import { Request, Response } from "express";
import {
  UpdateVariableBusinessBodyDTO_I,
  UpdateVariableBusinessParamsDTO_I,
  UpdateVariableBusinessQueryDTO_I,
} from "./DTO";
import { UpdateVariableBusinessUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateVariableBusinessController = (
  useCase: UpdateVariableBusinessUseCase
) => {
  const execute = async (
    req: Request<
      UpdateVariableBusinessParamsDTO_I,
      any,
      UpdateVariableBusinessBodyDTO_I,
      UpdateVariableBusinessQueryDTO_I
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
