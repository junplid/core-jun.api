import { Request, Response } from "express";
import {
  CreateCloneSectorAttendantBodyDTO_I,
  CreateCloneSectorAttendantParamsDTO_I,
} from "./DTO";
import { CreateCloneSectorAttendantUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneSectorAttendantController = (
  useCase: CreateCloneSectorAttendantUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneSectorAttendantParamsDTO_I,
      any,
      CreateCloneSectorAttendantBodyDTO_I
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
