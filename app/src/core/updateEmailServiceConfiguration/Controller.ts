import { Request, Response } from "express";
import {
  UpdateEmailServiceConfigurationBodyDTO_I,
  UpdateEmailServiceConfigurationParamsDTO_I,
  UpdateEmailServiceConfigurationQueryDTO_I,
} from "./DTO";
import { UpdateEmailServiceConfigurationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateEmailServiceConfigurationController = (
  useCase: UpdateEmailServiceConfigurationUseCase
) => {
  const execute = async (
    req: Request<
      UpdateEmailServiceConfigurationParamsDTO_I,
      any,
      UpdateEmailServiceConfigurationBodyDTO_I,
      UpdateEmailServiceConfigurationQueryDTO_I
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
