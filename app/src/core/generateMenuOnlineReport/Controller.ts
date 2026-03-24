import { Request, Response } from "express";
import {
  GenerateMenuOnlineReportBodyDTO_I,
  GenerateMenuOnlineReportParamsDTO_I,
} from "./DTO";
import { GenerateMenuOnlineReportUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GenerateMenuOnlineReportController = (
  useCase: GenerateMenuOnlineReportUseCase,
) => {
  const execute = async (
    req: Request<
      GenerateMenuOnlineReportParamsDTO_I,
      any,
      GenerateMenuOnlineReportBodyDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params }, res);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${data.filename}.pdf"`,
      );
      res.setHeader("Cache-Control", "no-store");

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
