import { Request, Response } from "express";
import {
  UpdateFunnelKanbanTicketBodyDTO_I,
  UpdateFunnelKanbanTicketParamsDTO_I,
} from "./DTO";
import { UpdateFunnelKanbanTicketUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateFunnelKanbanTicketController = (
  useCase: UpdateFunnelKanbanTicketUseCase
) => {
  const execute = async (
    req: Request<
      UpdateFunnelKanbanTicketParamsDTO_I,
      any,
      UpdateFunnelKanbanTicketBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.params, ...req.body });
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
