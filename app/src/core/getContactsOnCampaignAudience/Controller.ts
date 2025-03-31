import { Request, Response } from "express";
import {
  GetCampaignAudienceBodyDTO_I,
  GetCampaignAudienceParamsDTO_I,
} from "./DTO";
import { GetCampaignAudienceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCampaignAudienceController = (
  useCase: GetCampaignAudienceUseCase
) => {
  const execute = async (
    req: Request<
      GetCampaignAudienceParamsDTO_I,
      any,
      GetCampaignAudienceBodyDTO_I
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
