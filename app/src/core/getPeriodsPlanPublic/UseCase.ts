import { GetPeriodsPlanPublicRepository_I } from "./Repository";
import { GetPeriodsPlanPublicDTO_I } from "./DTO";
import moment from "moment-timezone";
import { TypeCyclePlanPeriods } from "@prisma/client";

const translateCyclePlan: { [x in TypeCyclePlanPeriods]: string } = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMIANNUALLY: "Semestral",
  YEARLY: "Anual",
};

const daysCyclePlan: { [x in TypeCyclePlanPeriods]: number } = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  BIMONTHLY: 60,
  QUARTERLY: 90,
  SEMIANNUALLY: 180,
  YEARLY: 365,
};

export class GetPeriodsPlanPublicUseCase {
  constructor(private repository: GetPeriodsPlanPublicRepository_I) {}

  async run(dto: GetPeriodsPlanPublicDTO_I) {
    // const redis = await clientRedis();
    // const plansCache = await redis.get(`plan-${dto.planId}_periods`);

    // if (plansCache) {
    //   const plans = JSON.parse(plansCache) as PlanPeriods[];
    //   const nextState = plans.map((period) => {
    //     const next_day_renewal = moment()
    //       .add(period.months, "months")
    //       .format("DD/MM/YYYY");
    //     return {
    //       ...period,
    //       next_day_renewal,
    //     };
    //   });
    //   return {
    //     message: "Conexão criada com sucesso!",
    //     status: 200,
    //     periods: nextState,
    //   };
    // }

    const plans = await this.repository.fetch({ planId: Number(dto.planId) });
    // redis.set(`plan-${dto.planId}_periods`, JSON.stringify(plans));
    // redis.expire(`plan-${dto.planId}_periods`, 60 * 60);

    const nextState = plans.map((period) => {
      const next_day_renewal = moment()
        .add(daysCyclePlan[period.cycle], "days")
        .format("DD/MM/YYYY");
      return {
        ...period,
        next_day_renewal,
        cycle: translateCyclePlan[period.cycle],
      };
    });

    return {
      message: "Conexão criada com sucesso!",
      status: 200,
      periods: nextState,
    };
  }
}
