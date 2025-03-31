import { Request, Response } from "express";
import { GetAttendantAiBodyDTO_I, GetAttendantAiParamsDTO_I } from "./DTO";
import { GetAttendantAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetAttendantAiController = (useCase: GetAttendantAiUseCase) => {
  const execute = async (
    req: Request<GetAttendantAiParamsDTO_I, any, GetAttendantAiBodyDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
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
