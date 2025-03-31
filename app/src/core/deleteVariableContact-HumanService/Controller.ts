import { Request, Response } from "express";
import {
  DeleteVariableContactHumanServiceBodyDTO_I,
  DeleteVariableContactHumanServiceParamsDTO_I,
} from "./DTO";
import { DeleteVariableContactHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteVariableContactHumanServiceController = (
  useCase: DeleteVariableContactHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      DeleteVariableContactHumanServiceParamsDTO_I,
      any,
      DeleteVariableContactHumanServiceBodyDTO_I
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
