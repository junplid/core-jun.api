import { Request, Response } from "express";
import {
  UpdatePosFunnelKanbanBodyDTO_I,
  UpdatePosFunnelKanbanParamsDTO_I,
} from "./DTO";
import { UpdatePosFunnelKanbanUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdatePosFunnelKanbanController = (
  useCase: UpdatePosFunnelKanbanUseCase
) => {
  const execute = async (
    req: Request<
      UpdatePosFunnelKanbanParamsDTO_I,
      any,
      UpdatePosFunnelKanbanBodyDTO_I
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
