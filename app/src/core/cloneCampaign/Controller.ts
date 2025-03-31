import { Request, Response } from "express";
import { CloneCampaignBodyDTO_I, CloneCampaignParamsDTO_I } from "./DTO";
import { CloneCampaignUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CloneCampaignController = (useCase: CloneCampaignUseCase) => {
  const execute = async (
    req: Request<CloneCampaignParamsDTO_I, any, CloneCampaignBodyDTO_I>,
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
