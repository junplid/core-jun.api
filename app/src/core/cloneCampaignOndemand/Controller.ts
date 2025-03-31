import { Request, Response } from "express";
import {
  CloneCampaignOndemandBodyDTO_I,
  CloneCampaignOndemandParamsDTO_I,
} from "./DTO";
import { CloneCampaignOndemandUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CloneCampaignOndemandController = (
  useCase: CloneCampaignOndemandUseCase
) => {
  const execute = async (
    req: Request<
      CloneCampaignOndemandParamsDTO_I,
      any,
      CloneCampaignOndemandBodyDTO_I
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
