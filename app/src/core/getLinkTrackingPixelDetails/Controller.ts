import { Request, Response } from "express";
import {
  GetLinkTrackingPixelDetailsBodyDTO_I,
  GetLinkTrackingPixelDetailsParamsDTO_I,
} from "./DTO";
import { GetLinkTrackingPixelDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetLinkTrackingPixelDetailsController = (
  useCase: GetLinkTrackingPixelDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetLinkTrackingPixelDetailsParamsDTO_I,
      any,
      GetLinkTrackingPixelDetailsBodyDTO_I
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
