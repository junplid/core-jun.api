import { Request, Response } from "express";
import {
  CreateImageConnectionUserBodyDTO_I,
  CreateImageConnectionUserParamsDTO_I,
} from "./DTO";
import { CreateImageConnectionUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateImageConnectionUserController = (
  useCase: CreateImageConnectionUserUseCase
) => {
  const execute = async (
    req: Request<
      CreateImageConnectionUserParamsDTO_I,
      any,
      CreateImageConnectionUserBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      console.log("AQUI contolre");
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
