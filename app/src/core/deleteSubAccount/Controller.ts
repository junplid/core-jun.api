import { Request, Response } from "express";
import { DeleteSubAccountBodyDTO_I, DeleteSubAccountParamsDTO_I } from "./DTO";
import { DeleteSubAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteSubAccountController = (
  useCase: DeleteSubAccountUseCase
) => {
  const execute = async (
    req: Request<DeleteSubAccountParamsDTO_I, any, DeleteSubAccountBodyDTO_I>,
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
