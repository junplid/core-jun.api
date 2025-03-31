import { Request, Response } from "express";
import {
  CreateCloneAttendantAiBodyDTO_I,
  CreateCloneAttendantAiParamsDTO_I,
} from "./DTO";
import { CreateCloneAttendantAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneAttendantAiController = (
  useCase: CreateCloneAttendantAiUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneAttendantAiParamsDTO_I,
      any,
      CreateCloneAttendantAiBodyDTO_I
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
