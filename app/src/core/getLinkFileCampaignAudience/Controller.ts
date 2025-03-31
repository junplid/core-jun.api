import { Request, Response } from "express";
import {
  GetLinkFileCampaignAudienceBodyDTO_I,
  GetLinkFileCampaignAudienceParamsDTO_I,
} from "./DTO";
import { GetLinkFileCampaignAudienceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetLinkFileCampaignAudienceController = (
  useCase: GetLinkFileCampaignAudienceUseCase
) => {
  const execute = async (
    req: Request<
      GetLinkFileCampaignAudienceParamsDTO_I,
      any,
      GetLinkFileCampaignAudienceBodyDTO_I
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
