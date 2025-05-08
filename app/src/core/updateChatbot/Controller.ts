import { Request, Response } from "express";
import {
  UpdateChatbotBodyDTO_I,
  UpdateChatbotBodyQueryDTO_I,
  UpdateChatbotParamsDTO_I,
} from "./DTO";
import { UpdateChatbotUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateChatbotController = (useCase: UpdateChatbotUseCase) => {
  const execute = async (
    req: Request<
      UpdateChatbotParamsDTO_I,
      any,
      UpdateChatbotBodyDTO_I,
      UpdateChatbotBodyQueryDTO_I
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
