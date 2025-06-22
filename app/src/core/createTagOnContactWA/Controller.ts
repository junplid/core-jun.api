import { Request, Response } from "express";
import {
  CreateTagOnContactWAQueryDTO_I,
  CreateTagOnContactWABodyDTO_I,
  CreateTagOnContactWAParamsDTO_I,
} from "./DTO";
import { CreateTagOnContactWAUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateTagOnContactWAController = (
  useCase: CreateTagOnContactWAUseCase
) => {
  const execute = async (
    req: Request<
      CreateTagOnContactWAParamsDTO_I,
      any,
      CreateTagOnContactWABodyDTO_I,
      CreateTagOnContactWAQueryDTO_I
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
