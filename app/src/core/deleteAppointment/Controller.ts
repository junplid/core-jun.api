import { Request, Response } from "express";
import {
  DeleteAppointmentBodyDTO_I,
  DeleteAppointmentParamsDTO_I,
} from "./DTO";
import { DeleteAppointmentUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteAppointmentController = (
  useCase: DeleteAppointmentUseCase
) => {
  const execute = async (
    req: Request<DeleteAppointmentParamsDTO_I, any, DeleteAppointmentBodyDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params };
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
