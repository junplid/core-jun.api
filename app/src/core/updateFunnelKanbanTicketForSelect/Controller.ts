import { Request, Response } from "express";
import {
  UpdateFunnelKanbanTicketForSelectBodyDTO_I,
  UpdateFunnelKanbanTicketForSelectParamsDTO_I,
} from "./DTO";
import { UpdateFunnelKanbanTicketForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateFunnelKanbanTicketForSelectController = (
  useCase: UpdateFunnelKanbanTicketForSelectUseCase
) => {
  const execute = async (
    req: Request<
      UpdateFunnelKanbanTicketForSelectParamsDTO_I,
      any,
      UpdateFunnelKanbanTicketForSelectBodyDTO_I
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
