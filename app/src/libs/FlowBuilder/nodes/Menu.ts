import {
  countAttemptsMenu,
  flowsMap,
  isSendMessageOfFailedAttempts,
} from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { ModelFlows } from "../../../adapters/mongo/models/flows";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { NodeMenuData } from "../Payload";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

interface PropsNodeReply {
  numberLead: string;
  numberConnection: string;
  data: NodeMenuData;
  message: string;
  connectionWhatsId: number;
  flowStateId: number;
  contactsWAOnAccountId: number;
  accountId: number;
  nodeId: string;
}

type ResultPromise =
  | { action: "END_FLOW" | "REPLY_FAIL"; line?: string }
  | { action: "SUBMIT_FLOW"; flowId: string }
  | { action: "FORK"; type: "timeOut" | "failedAttempts" }
  | { action: "SUCESS"; handleId: string };

export const NodeMenu = (props: PropsNodeReply): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    const keyMap = props.numberConnection + props.numberLead;

    const { message, data } = props;

    const messageErrorAttempts = data.validateReply?.messageErrorAttempts;

    let sucessReply: boolean = true;

    const activatedItem = data.items.find((item) => {
      return item.activators.some((ac) => {
        const isAc = ac.value.toLowerCase() === message.toLowerCase();
        const isItem = item.value.toLowerCase() === message.toLowerCase();
        return isAc || isItem;
      });
    });

    if (!activatedItem && messageErrorAttempts) {
      try {
        sucessReply = false;
        await TypingDelay({
          delay: Number(props.data.interval),
          toNumber: props.numberLead,
          connectionId: props.connectionWhatsId,
        });
        await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: messageErrorAttempts.value,
          toNumber: props.numberLead,
        });
      } catch (error) {
        console.log(error);
      }
      let countAttempts = countAttemptsMenu.get(keyMap);
      if (!countAttempts) {
        countAttemptsMenu.set(keyMap, 1);
      } else {
        countAttempts += 1;
        countAttemptsMenu.set(keyMap, countAttempts);
      }
    }

    const countAttempts = countAttemptsMenu.get(keyMap) ?? 0;
    const doSendMessageFailAttempts = isSendMessageOfFailedAttempts.get(keyMap);
    const attempts = data.validateReply?.attempts || 0;

    if (attempts && countAttempts >= attempts && !doSendMessageFailAttempts) {
      try {
        if (data.validateReply?.failedAttempts) {
          await TypingDelay({
            delay: Number(data.validateReply.failedAttempts.interval),
            toNumber: props.numberLead,
            connectionId: props.connectionWhatsId,
          });
          await SendMessageText({
            connectionId: props.connectionWhatsId,
            text: data.validateReply.failedAttempts.value,
            toNumber: props.numberLead,
          });
        }
      } catch (error) {
        console.log(error);
      }
      isSendMessageOfFailedAttempts.set(keyMap, true);
      countAttemptsMenu.set(keyMap, 0);
      const failedAttempts = data.validateReply?.failedAttempts;

      if (failedAttempts && failedAttempts.action === "END_FLOW") {
        await prisma.flowState.update({
          where: { id: props.flowStateId },
          data: { isFinish: true },
        });
        return res({ action: failedAttempts.action });
      }
      if (failedAttempts && failedAttempts.action === "SUBMIT_FLOW") {
        let flowAlreadyExists = flowsMap.get(
          failedAttempts.submitFlowId.toString()
        );

        if (!flowAlreadyExists) {
          const newFlow = await ModelFlows.aggregate([
            {
              $match: {
                accountId: 1,
                _id: failedAttempts.submitFlowId,
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
          flowsMap.set(failedAttempts.submitFlowId.toString(), {
            nodes,
            edges,
          });
        }

        await prisma.flowState.update({
          where: { id: props.flowStateId },
          data: { flowId: failedAttempts.submitFlowId },
        });
        return res({
          action: "SUBMIT_FLOW",
          flowId: failedAttempts.submitFlowId.toString(),
        });
      }

      return res({ action: "FORK", type: "failedAttempts" });
    }
    if (!sucessReply) return res({ action: "REPLY_FAIL" });
    countAttemptsMenu.delete(keyMap);
    isSendMessageOfFailedAttempts.delete(keyMap);

    const handleId = activatedItem?.key as string;
    return res({ action: "SUCESS", handleId });
  });
