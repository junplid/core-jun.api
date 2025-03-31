import { Request, Response } from "express";
import {
  CreateCloneConnectionWaBodyDTO_I,
  CreateCloneConnectionWaParamsDTO_I,
} from "./DTO";
import { CreateCloneConnectionWaUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneConnectionWaController = (
  useCase: CreateCloneConnectionWaUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneConnectionWaParamsDTO_I,
      any,
      CreateCloneConnectionWaBodyDTO_I
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
