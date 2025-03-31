import { GetPlansRootRepository_I } from "./Repository";
import { GetPlansRootDTO_I } from "./DTO";
import { clientRedis } from "../../adapters/RedisDB";

export class GetPlansRootUseCase {
  constructor(private repository: GetPlansRootRepository_I) {}

  async run(_dto: GetPlansRootDTO_I) {
    // const redis = await clientRedis();
    // const plansCache = await redis.get("plans");

    // if (plansCache) {
    //   const plans = JSON.parse(plansCache);
    //   return {
    //     message: "Conexão criada com sucesso!",
    //     status: 200,
    //     plans,
    //   };
    // }

    const plans = await this.repository.fetch();
    // redis.set("plans", JSON.stringify(plans));

    return {
      message: "Conexão criada com sucesso!",
      status: 200,
      plans,
    };
  }
}
