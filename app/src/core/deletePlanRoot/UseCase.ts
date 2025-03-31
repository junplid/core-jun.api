import { DeletePlanRepository_I } from "./Repository";
import { DeletePlanDTO_I } from "./DTO";
import { clientRedis } from "../../adapters/RedisDB";
import { Plan } from "@prisma/client";

export class DeletePlanUseCase {
  constructor(private repository: DeletePlanRepository_I) {}

  async run(dto: DeletePlanDTO_I) {
    const id = Number(dto.id);
    await this.repository.delete({ id });

    const redis = await clientRedis();
    const plansCache = await redis.get("plans");
    await redis.del("plans-public");

    if (plansCache) {
      const plans: Plan[] = JSON.parse(plansCache);
      const newState = plans.filter((plan) => plan.id !== id);
      await redis.set("plans", JSON.stringify(newState));
      return {
        message: "Plano apagado com sucesso!",
        status: 200,
      };
    }

    return {
      message: "Plano apagado com sucesso!",
      status: 200,
    };
  }
}
