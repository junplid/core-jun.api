import { Request, Response } from "express";
import {
  GetFileCampaignAudienceBodyDTO_I,
  GetFileCampaignAudienceDTO_I,
  GetFileCampaignAudienceParamsDTO_I,
} from "./DTO";
import { GetFileCampaignAudienceUseCase } from "./UseCase";
import moment from "moment-timezone";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFileCampaignAudienceController = (
  useCase: GetFileCampaignAudienceUseCase
) => {
  const execute = async (
    req: Request<
      GetFileCampaignAudienceParamsDTO_I,
      any,
      GetFileCampaignAudienceDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params });

      const filename = `${data.namePlataform}-#${
        req.body.id || req.params.id
      }_${data.audienceName}_${moment().format("DD-MM-YYYY")}.xlsx`;

      res.setHeader("Content-Disposition", "attachment; filename=" + filename);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.status(200).send(data.file);
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
