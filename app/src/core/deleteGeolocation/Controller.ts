import { Request, Response } from "express";
import {
  DeleteGeolocationBodyDTO_I,
  DeleteGeolocationParamsDTO_I,
} from "./DTO";
import { DeleteGeolocationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteGeolocationController = (
  useCase: DeleteGeolocationUseCase
) => {
  const execute = async (
    req: Request<DeleteGeolocationParamsDTO_I, any, DeleteGeolocationBodyDTO_I>,
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
