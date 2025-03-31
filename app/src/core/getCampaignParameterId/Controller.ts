import { Request, Response } from "express";
import {
  GetCampaignParameterIdBodyDTO_I,
  GetCampaignParameterIdParamsDTO_I,
} from "./DTO";
import { GetCampaignParameterIdUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCampaignParameterIdController = (
  useCase: GetCampaignParameterIdUseCase
) => {
  const execute = async (
    req: Request<
      GetCampaignParameterIdParamsDTO_I,
      any,
      GetCampaignParameterIdBodyDTO_I
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
