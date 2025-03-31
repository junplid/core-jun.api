import { Request, Response } from "express";
import {
  DeleteEmailServiceConfigurationBodyDTO_I,
  DeleteEmailServiceConfigurationParamsDTO_I,
} from "./DTO";
import { DeleteEmailServiceConfigurationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteEmailServiceConfigurationController = (
  useCase: DeleteEmailServiceConfigurationUseCase
) => {
  const execute = async (
    req: Request<
      DeleteEmailServiceConfigurationParamsDTO_I,
      any,
      DeleteEmailServiceConfigurationBodyDTO_I
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
