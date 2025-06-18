import { Request, Response } from "express";
import { ResolveTicketBodyDTO_I, ResolveTicketParamsDTO_I } from "./DTO";
import { ResolveTicketUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const ResolveTicketController = (useCase: ResolveTicketUseCase) => {
  const execute = async (
    req: Request<ResolveTicketParamsDTO_I, any, ResolveTicketBodyDTO_I>,
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
