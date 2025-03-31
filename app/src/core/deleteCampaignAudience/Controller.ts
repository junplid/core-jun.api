import { Request, Response } from "express";
import {
  DeleteCampaignAudienceBodyDTO_I,
  DeleteCampaignAudienceParamsDTO_I,
} from "./DTO";
import { DeleteCampaignAudienceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteCampaignAudienceController = (
  useCase: DeleteCampaignAudienceUseCase
) => {
  const execute = async (
    req: Request<
      DeleteCampaignAudienceParamsDTO_I,
      any,
      DeleteCampaignAudienceBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params };
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
