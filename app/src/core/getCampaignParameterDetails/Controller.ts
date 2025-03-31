import { Request, Response } from "express";
import {
  GetCampaignParameterDetailsBodyDTO_I,
  GetCampaignParameterDetailsParamsDTO_I,
} from "./DTO";
import { GetCampaignParameterDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCampaignParameterDetailsController = (
  useCase: GetCampaignParameterDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetCampaignParameterDetailsParamsDTO_I,
      any,
      GetCampaignParameterDetailsBodyDTO_I
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
