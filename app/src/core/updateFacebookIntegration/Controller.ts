import { Request, Response } from "express";
import {
  UpdateFacebookIntegrationBodyDTO_I,
  UpdateFacebookIntegrationParamsDTO_I,
  UpdateFacebookIntegrationQueryDTO_I,
} from "./DTO";
import { UpdateFacebookIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateFacebookIntegrationController = (
  useCase: UpdateFacebookIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      UpdateFacebookIntegrationParamsDTO_I,
      any,
      UpdateFacebookIntegrationBodyDTO_I,
      UpdateFacebookIntegrationQueryDTO_I
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
