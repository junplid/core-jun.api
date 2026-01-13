import { Request, Response } from "express";
import {
  UpdateAppointmentBodyDTO_I,
  UpdateAppointmentParamsDTO_I,
  UpdateAppointmentQueryDTO_I,
} from "./DTO";
import { UpdateAppointmentUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateAppointmentController = (
  useCase: UpdateAppointmentUseCase
) => {
  const execute = async (
    req: Request<
      UpdateAppointmentParamsDTO_I,
      any,
      UpdateAppointmentBodyDTO_I,
      UpdateAppointmentQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
      const data = await useCase.run(dto);
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
