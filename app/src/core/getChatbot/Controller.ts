import { Request, Response } from "express";
import { GetChatbotBodyDTO_I, GetChatbotParamsDTO_I } from "./DTO";
import { GetChatbotUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetChatbotController = (useCase: GetChatbotUseCase) => {
  const execute = async (
    req: Request<GetChatbotParamsDTO_I, any, GetChatbotBodyDTO_I>,
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
