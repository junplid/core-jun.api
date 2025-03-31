import { Request, Response } from "express";
import {
  UpdateCampaignOndemandBodyDTO_I,
  UpdateCampaignOndemandParamsDTO_I,
  UpdateCampaignOndemandQueryDTO_I,
} from "./DTO";
import { UpdateCampaignOndemandUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateCampaignOndemandController = (
  useCase: UpdateCampaignOndemandUseCase
) => {
  const execute = async (
    req: Request<
      UpdateCampaignOndemandParamsDTO_I,
      any,
      UpdateCampaignOndemandBodyDTO_I,
      UpdateCampaignOndemandQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
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
