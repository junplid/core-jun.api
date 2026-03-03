import { Request, Response } from "express";
import {
  UpdateAgentTemplate_root_BodyDTO_I,
  UpdateAgentTemplate_root_ParamsDTO_I,
} from "./DTO";
import { UpdateAgentTemplate_root_UseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateAgentTemplate_root_Controller = (
  useCase: UpdateAgentTemplate_root_UseCase,
) => {
  const execute = async (
    req: Request<
      UpdateAgentTemplate_root_ParamsDTO_I,
      any,
      UpdateAgentTemplate_root_BodyDTO_I
    >,
    res: Response,
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
