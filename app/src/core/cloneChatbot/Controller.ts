import { Request, Response } from "express";
import {
  CreateCloneChatbotBodyDTO_I,
  CreateCloneChatbotParamsDTO_I,
} from "./DTO";
import { CreateCloneChatbotUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneChatbotController = (
  useCase: CreateCloneChatbotUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneChatbotParamsDTO_I,
      any,
      CreateCloneChatbotBodyDTO_I
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
