import { Request, Response } from "express";
import {
  DeleteSectorAttendantBodyDTO_I,
  DeleteSectorAttendantParamsDTO_I,
} from "./DTO";
import { DeleteSectorAttendantUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteSectorAttendantController = (
  useCase: DeleteSectorAttendantUseCase
) => {
  const execute = async (
    req: Request<
      DeleteSectorAttendantParamsDTO_I,
      any,
      DeleteSectorAttendantBodyDTO_I
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
