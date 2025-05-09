import { flowsMap } from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { ModelFlows } from "../../../adapters/mongo/models/flows";
import { NodeSendFlowData } from "../Payload";

interface PropsNodeSendFlow {
  data: NodeSendFlowData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  nodeId: string;
}

type ResultPromise =
  | { action: "CONTINUE" }
  | { action: "END_FLOW" }
  | { action: "SUBMIT_FLOW"; nodes: any; edges: any };

export const NodeSendFlow = (props: PropsNodeSendFlow): Promise<void> =>
  new Promise(async (res, _rej) => {
    let flowAlreadyExists = flowsMap.get(String(props.data.id));
    console.log({ flowAlreadyExists });
    if (!flowAlreadyExists) {
      const newFlow = await ModelFlows.aggregate([
        {
          $match: {
            _id: props.data.id,
          },
        },
        {
          $project: {
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

      if (!newFlow?.length) {
        return "SE CASO O FLUXO QUE ELE ESCOLHEU NÃO EXISTIR?";
      }

      const { nodes, edges } = newFlow[0];
      flowsMap.set(props.data.id.toString(), {
        nodes,
        edges,
      });
      flowAlreadyExists = { nodes, edges };
    }
    await prisma.flowState.update({
      where: { id: props.flowStateId },
      data: { flowId: props.data.id },
    });
    return res({
      action: "SUBMIT_FLOW",
      ...flowAlreadyExists,
    });

    return res();
  });
