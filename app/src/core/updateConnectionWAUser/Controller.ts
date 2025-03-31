import { Request, Response } from "express";
import {
  UpdateConnectionWAUserBodyDTO_I,
  UpdateConnectionWAUserParamsDTO_I,
  UpdateConnectionWAUserQueryDTO_I,
} from "./DTO";
import { UpdateConnectionWAUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateConnectionWAUserController = (
  useCase: UpdateConnectionWAUserUseCase
) => {
  const execute = async (
    req: Request<
      UpdateConnectionWAUserParamsDTO_I,
      any,
      UpdateConnectionWAUserBodyDTO_I,
      UpdateConnectionWAUserQueryDTO_I
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
