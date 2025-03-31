import { Request, Response } from "express";
import {
  DeleteBusinessOnAccountBodyDTO_I,
  DeleteBusinessOnAccountParamsDTO_I,
} from "./DTO";
import { DeleteBusinessOnAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteBusinessOnAccountController = (
  useCase: DeleteBusinessOnAccountUseCase
) => {
  const execute = async (
    req: Request<
      DeleteBusinessOnAccountParamsDTO_I,
      any,
      DeleteBusinessOnAccountBodyDTO_I
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
