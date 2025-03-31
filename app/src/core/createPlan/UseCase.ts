import { prisma } from "../../adapters/Prisma/client";
import { CreatePlanDTO_I } from "./DTO";
export class CreatePlanUseCase {
  constructor() {}

  async run({ rootId, ...dto }: CreatePlanDTO_I) {
    const free_trial_time = dto.type === "free" ? 0 : dto.free_trial_time;

    const { PlanAssets, PlanPeriods, ...rest } = { ...dto, free_trial_time };

    const data = await prisma.plan.create({
      data: {
        ...rest,
        PlanAssets: { create: PlanAssets },
        ...(PlanPeriods?.length && {
          PlanPeriods: {
            createMany: { data: PlanPeriods },
          },
        }),
      },
      select: { id: true, createAt: true },
    });

    return {
      message: "Plano criado com sucesso!",
      status: 200,
      plan: data,
    };
  }
}
