import { Request, Response } from "express";
import {
  GetKanbanForSelectBodyDTO_I,
  GetKanbanForSelectParamsDTO_I,
} from "./DTO";
import { GetKanbanForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetKanbanForSelectController = (
  useCase: GetKanbanForSelectUseCase
) => {
  const execute = async (
    req: Request<
      GetKanbanForSelectParamsDTO_I,
      any,
      GetKanbanForSelectBodyDTO_I
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
