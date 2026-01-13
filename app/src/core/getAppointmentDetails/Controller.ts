import { Request, Response } from "express";
import {
  GetAppointmentDetailsBodyDTO_I,
  GetAppointmentDetailsParamsDTO_I,
} from "./DTO";
import { GetAppointmentDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetAppointmentDetailsController = (
  useCase: GetAppointmentDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetAppointmentDetailsParamsDTO_I,
      any,
      GetAppointmentDetailsBodyDTO_I
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
