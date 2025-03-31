import { Request, Response } from "express";
import { DeleteAtendantAiBodyDTO_I, DeleteAtendantAiParamsDTO_I } from "./DTO";
import { DeleteAtendantAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteAtendantAiController = (
  useCase: DeleteAtendantAiUseCase
) => {
  const execute = async (
    req: Request<DeleteAtendantAiParamsDTO_I, any, DeleteAtendantAiBodyDTO_I>,
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
