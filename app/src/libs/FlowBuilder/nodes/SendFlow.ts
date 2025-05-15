import { cacheFlowsMap } from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { ModelFlows } from "../../../adapters/mongo/models/flows";
import { NodeSendFlowData } from "../Payload";

interface PropsNodeSendFlow {
  data: NodeSendFlowData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  nodeId: string;
}

export const NodeSendFlow = async (
  props: PropsNodeSendFlow
): Promise<{
  flowId: number;
  nodes: any[];
  edges: any[];
  businessIds: number[];
}> => {
  let flowAlreadyExists = cacheFlowsMap.get(props.data.id);
  if (!flowAlreadyExists) {
    const newFlow = await ModelFlows.aggregate([
      {
        $match: {
          _id: props.data.id,
        },
      },
      {
        $project: {
          businessIds: 1,
          nodes: {
            $map: {
              input: "$data.nodes",
              in: {
                id: "$$this.id",
                type: "$$this.type",
                data: "$$this.data",
              },
            },
          },
          edges: {
            $map: {
              input: "$data.edges",
              in: {
                id: "$$this.id",
                source: "$$this.source",
                target: "$$this.target",
              },
            },
          },
        },
      },
    ]);

    const { nodes, edges, businessIds } = newFlow[0];
    flowAlreadyExists = { nodes, edges, businessIds };
    cacheFlowsMap.set(props.data.id, flowAlreadyExists);
  }
  await prisma.flowState.update({
    where: { id: props.flowStateId },
    data: { flowId: props.data.id },
  });
  return { flowId: props.data.id, ...flowAlreadyExists };
};
