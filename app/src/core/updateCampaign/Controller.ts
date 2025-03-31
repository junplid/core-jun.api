import { Request, Response } from "express";
import { UpdateCampaignBodyDTO_I, UpdateCampaignParamsDTO_I } from "./DTO";
import { UpdateCampaignUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateCampaignController = (useCase: UpdateCampaignUseCase) => {
  const execute = async (
    req: Request<UpdateCampaignParamsDTO_I, any, UpdateCampaignBodyDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
      });
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
