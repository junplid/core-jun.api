import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeMessageData } from "../Payload";
import { currentNodeFlow } from "../cache";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import phone from "libphonenumber-js";

interface PropsNodeMessage {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeMessageData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
}

const findVariablesConstants = async (accountId: number) => {
  return await prisma.variable.findMany({
    where: { accountId },
    select: { name: true, value: true },
  });
};

const findVariablesOnContactWA = async (
  contactsWAOnAccountId: number
): Promise<
  {
    value: string;
    name: string;
  }[]
> => {
  const variables = await prisma.contactsWAOnAccountVariable.findMany({
    where: { contactsWAOnAccountId },
    select: {
      value: true,
      Variable: { select: { name: true } },
    },
  });
  return variables.map((v) => ({
    name: v.Variable.name,
    value: v.value,
  }));
};

export const NodeMessage = (props: PropsNodeMessage): Promise<void> => {
  return new Promise(async (res, rej) => {
    const thereVariable: boolean = !!props.data.message.match(/{{\w+}}/g);
    let variables: { name: string; value: string }[] = [];

    if (thereVariable && props.contactsWAOnAccountId) {
      variables = await findVariablesOnContactWA(props.contactsWAOnAccountId);
      const findVarConst = await prisma.variable.findMany({
        where: { accountId: props.accountId },
        select: { name: true, value: true },
      });
      const varConst = findVarConst.filter((s) => s.value && s) as {
        name: string;
        value: string;
      }[];
      const varsSystem = getVariableSystem();
      const leadInfo = await prisma.contactsWAOnAccount.findFirst({
        where: { id: props.contactsWAOnAccountId },
        select: {
          name: true,
          ContactsWA: { select: { completeNumber: true } },
        },
      });

      let numberLeadFormated: string = "{{SYS_NUMERO_LEAD_WHATSAPP}}";

      const numberPhone = phone(`+${leadInfo?.ContactsWA.completeNumber}`)
        ?.format("INTERNATIONAL")
        .split(" ");
      if (numberPhone) {
        console.log({ numberPhone });
        if (numberPhone?.length === 2) {
          numberLeadFormated = String(numberPhone)
            .replace(/\D+/g, "")
            .replace(/(55)(\d{2})(\d{4})(\d{4})/, "$2 9$3-$4");
        } else {
          numberLeadFormated = `${numberPhone[1]} ${numberPhone[2]}-${numberPhone[3]}`;
        }
      }

      const outhersVARS = [
        {
          name: "SYS_NOME_NO_WHATSAPP",
          value: leadInfo?.name ?? "{{SYS_NOME_NO_WHATSAPP}}",
        },
        {
          name: "SYS_NUMERO_LEAD_WHATSAPP",
          value: numberLeadFormated,
        },
        {
          name: "SYS_BUSINESS_NAME",
          value: props.businessName,
        },
        {
          name: "SYS_LINK_WHATSAPP_LEAD",
          value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
        },
        {
          name: "SYS_PROTOCOLO_DE_ATENDIMENTO",
          value: props.ticketProtocol ?? "{{SYS_PROTOCOLO_DE_ATENDIMENTO}}",
        },
      ];
      variables = [...variables, ...varConst, ...varsSystem, ...outhersVARS];
    }

    try {
      await TypingDelay({
        delay: Number(props.data.interval),
        toNumber: props.numberLead,
        connectionId: props.connectionWhatsId,
      });
    } catch (error) {
      rej(error);
    }

    let newMessage = structuredClone(props.data.message);
    for await (const variable of variables) {
      const regex = new RegExp(`({{${variable.name}}})`, "g");
      newMessage = newMessage.replace(regex, variable.value);
    }
    try {
      await SendMessageText({
        connectionId: props.connectionWhatsId,
        text: newMessage,
        toNumber: props.numberLead,
      });
      // await props.botWA
      //   ?.sendMessage(props.numberLead, { text: newMessage })
      //   .catch((err) => console.log(err));
      return res();
    } catch (error) {
      console.log("error para enviar a mensagem", error);
      rej("Error ao enviar mensagem");
    }
    return;
  });
};
