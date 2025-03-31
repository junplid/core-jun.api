import { Request, Response } from "express";
import {
  CreateCloneBusinessBodyDTO_I,
  CreateCloneBusinessParamsDTO_I,
} from "./DTO";
import { CreateCloneBusinessUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneBusinessController = (
  useCase: CreateCloneBusinessUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneBusinessParamsDTO_I,
      any,
      CreateCloneBusinessBodyDTO_I
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
