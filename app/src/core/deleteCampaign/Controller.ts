import { Request, Response } from "express";
import { DeleteCampaignBodyDTO_I, DeleteCampaignParamsDTO_I } from "./DTO";
import { DeleteCampaignUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteCampaignController = (useCase: DeleteCampaignUseCase) => {
  const execute = async (
    req: Request<DeleteCampaignParamsDTO_I, any, DeleteCampaignBodyDTO_I>,
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
