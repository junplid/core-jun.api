import { Request, Response } from "express";
import {
  UpdateCampaignAudienceBodyDTO_I,
  UpdateCampaignAudienceParamsDTO_I,
  UpdateCampaignAudienceQueryDTO_I,
} from "./DTO";
import { UpdateCampaignAudienceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateCampaignAudienceController = (
  useCase: UpdateCampaignAudienceUseCase
) => {
  const execute = async (
    req: Request<
      UpdateCampaignAudienceParamsDTO_I,
      any,
      UpdateCampaignAudienceBodyDTO_I,
      UpdateCampaignAudienceQueryDTO_I
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
