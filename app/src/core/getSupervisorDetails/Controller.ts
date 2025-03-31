import { Request, Response } from "express";
import { GetSupervisorDetailsDTO_I } from "./DTO";
import { GetSupervisorDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetSupervisorDetailsController = (
  useCase: GetSupervisorDetailsUseCase
) => {
  const execute = async (
    req: Request<GetSupervisorDetailsDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.params,
        ...req.body,
      });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(error.statusCode ?? 500).json(error.details ?? error);
    }
  };

  return { execute };
};
