import { Request, Response } from "express";
import {
  DeleteContactWAOnAccountBodyDTO_I,
  DeleteContactWAOnAccountParamsDTO_I,
} from "./DTO";
import { DeleteContactWAOnAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteContactWAOnAccountOnAccountController = (
  useCase: DeleteContactWAOnAccountUseCase
) => {
  const execute = async (
    req: Request<
      DeleteContactWAOnAccountParamsDTO_I,
      any,
      DeleteContactWAOnAccountBodyDTO_I
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
