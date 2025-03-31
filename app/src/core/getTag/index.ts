import { GetTagController } from "./Controller";
import { GetTagUseCase } from "./UseCase";

export const getTagController = GetTagController(new GetTagUseCase()).execute;
