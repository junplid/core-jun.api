import { Request, Response } from "express";
import {
  GetCampaignOndemandDetailsBodyDTO_I,
  GetCampaignOndemandDetailsParamsDTO_I,
} from "./DTO";
import { GetCampaignOndemandDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCampaignOndemandDetailsController = (
  useCase: GetCampaignOndemandDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetCampaignOndemandDetailsParamsDTO_I,
      any,
      GetCampaignOndemandDetailsBodyDTO_I
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
