import { Request, Response } from "express";
import {
  GetLinkTrackingPixelBodyDTO_I,
  GetLinkTrackingPixelParamsDTO_I,
} from "./DTO";
import { GetLinkTrackingPixelUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetLinkTrackingPixelController = (
  useCase: GetLinkTrackingPixelUseCase
) => {
  const execute = async (
    req: Request<
      GetLinkTrackingPixelParamsDTO_I,
      any,
      GetLinkTrackingPixelBodyDTO_I
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
