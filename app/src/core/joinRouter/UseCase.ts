import { JoinRouterDTO_I } from "./DTO";

export class JoinRouterUseCase {
  constructor() {}

  async run(dto: JoinRouterDTO_I) {
    console.log(dto);

    return { status: 200 };
  }
}
