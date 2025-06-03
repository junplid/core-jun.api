import { Request, Response } from "express";
import {
  GetCampaignDetailsBodyDTO_I,
  GetCampaignDetailsParamsDTO_I,
} from "./DTO";
import { GetCampaignDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCampaignDetailsController = (
  useCase: GetCampaignDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetCampaignDetailsParamsDTO_I,
      any,
      GetCampaignDetailsBodyDTO_I
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
