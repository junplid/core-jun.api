import { Request, Response } from "express";
import {
  UpdateHelpSessionBodyDTO_I,
  UpdateHelpSessionParamsDTO_I,
} from "./DTO";
import { UpdateHelpSessionUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateHelpSessionController = (
  useCase: UpdateHelpSessionUseCase
) => {
  const execute = async (
    req: Request<UpdateHelpSessionParamsDTO_I, any, UpdateHelpSessionBodyDTO_I>,
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
