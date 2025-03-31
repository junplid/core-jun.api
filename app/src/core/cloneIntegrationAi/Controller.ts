import { Request, Response } from "express";
import {
  CreateCloneintegrationAiBodyDTO_I,
  CreateCloneintegrationAiParamsDTO_I,
} from "./DTO";
import { CreateCloneintegrationAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneintegrationAiController = (
  useCase: CreateCloneintegrationAiUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneintegrationAiParamsDTO_I,
      any,
      CreateCloneintegrationAiBodyDTO_I
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
