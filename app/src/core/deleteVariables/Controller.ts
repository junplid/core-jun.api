import { Request, Response } from "express";
import { DeleteVariableBodyDTO_I, DeleteVariableParamsDTO_I } from "./DTO";
import { DeleteVariableUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteVariableController = (useCase: DeleteVariableUseCase) => {
  const execute = async (
    req: Request<DeleteVariableParamsDTO_I, any, DeleteVariableBodyDTO_I>,
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
