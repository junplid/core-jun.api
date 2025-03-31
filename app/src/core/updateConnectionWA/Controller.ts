import { Request, Response } from "express";
import {
  UpdateConnectionWABodyDTO_I,
  UpdateConnectionWAParamsDTO_I,
  UpdateConnectionWAQueryDTO_I,
} from "./DTO";
import { UpdateConnectionWAUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateConnectionWAController = (
  useCase: UpdateConnectionWAUseCase
) => {
  const execute = async (
    req: Request<
      UpdateConnectionWAParamsDTO_I,
      any,
      UpdateConnectionWABodyDTO_I,
      UpdateConnectionWAQueryDTO_I
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
