import { Request, Response } from "express";
import {
  DeleteCampaignParameterBodyDTO_I,
  DeleteCampaignParameterParamsDTO_I,
} from "./DTO";
import { DeleteCampaignParameterUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteCampaignParameterController = (
  useCase: DeleteCampaignParameterUseCase
) => {
  const execute = async (
    req: Request<
      DeleteCampaignParameterParamsDTO_I,
      any,
      DeleteCampaignParameterBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.params, ...req.body });
      return res.status(data.status).json(data);
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
