import { Request, Response } from "express";
import {
  UpdateGeolocationBodyDTO_I,
  UpdateGeolocationParamsDTO_I,
  UpdateGeolocationQueryDTO_I,
} from "./DTO";
import { UpdateGeolocationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateGeolocationController = (
  useCase: UpdateGeolocationUseCase
) => {
  const execute = async (
    req: Request<
      UpdateGeolocationParamsDTO_I,
      any,
      UpdateGeolocationBodyDTO_I,
      UpdateGeolocationQueryDTO_I
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
