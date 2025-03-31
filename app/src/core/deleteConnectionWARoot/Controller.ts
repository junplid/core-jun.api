import { Request, Response } from "express";
import {
  DeleteConnectionWARootParamsDTO_I,
  DeleteConnectionWARootBodyDTO_I,
} from "./DTO";
import { DeleteConnectionWARootUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteConnectionWARootController = (
  useCase: DeleteConnectionWARootUseCase
) => {
  const execute = async (
    req: Request<
      DeleteConnectionWARootParamsDTO_I,
      any,
      DeleteConnectionWARootBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.params, ...req.body });
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
