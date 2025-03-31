import { Request, Response } from "express";
import {
  GetChatbotDetailsBodyDTO_I,
  GetChatbotDetailsParamsDTO_I,
} from "./DTO";
import { GetChatbotDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetChatbotDetailsController = (
  useCase: GetChatbotDetailsUseCase
) => {
  const execute = async (
    req: Request<GetChatbotDetailsParamsDTO_I, any, GetChatbotDetailsBodyDTO_I>,
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
