import { Request, Response } from "express";
import { DeleteKanbanBodyDTO_I, DeleteKanbanParamsDTO_I } from "./DTO";
import { DeleteKanbanUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteKanbanController = (useCase: DeleteKanbanUseCase) => {
  const execute = async (
    req: Request<DeleteKanbanParamsDTO_I, any, DeleteKanbanBodyDTO_I>,
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
