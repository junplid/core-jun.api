import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { GetFlowsDTO_I } from "./DTO";

export class GetFlowsUseCase {
  constructor() {}

  async run({ page = 0, ...dto }: GetFlowsDTO_I) {
    await mongo();
    const flows = await ModelFlows.find({
      accountId: dto.accountId,
      name: { $regex: dto.name || "", $options: "i" },
    })
      .skip(page * 15)
      .limit(15)
      .lean();

    const nextFlows = await Promise.all(
      flows.map(async (flow) => {
        const businesses = await prisma.business.findMany({
          where: { id: { in: flow.businessIds } },
          select: { name: true, id: true },
        });
        return {
          id: flow._id,
          name: flow.name,
          type: flow.type,
          createAt: flow.createdAt,
          updateAt: flow.updatedAt,
          businesses,
        };
      })
    );

    return {
      message: "OK!",
      status: 201,
      flows: nextFlows,
    };
  }
}
