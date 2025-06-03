import { Request, Response } from "express";
import { GetCampaignBodyDTO_I, GetCampaignParamsDTO_I } from "./DTO";
import { GetCampaignUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCampaignController = (useCase: GetCampaignUseCase) => {
  const execute = async (
    req: Request<GetCampaignParamsDTO_I, any, GetCampaignBodyDTO_I>,
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
