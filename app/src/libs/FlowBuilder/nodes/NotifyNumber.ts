import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeNotifyNumberData } from "../Payload";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import phone from "libphonenumber-js";

interface PropsNodeNotifyNumber {
  contactsWAOnAccountId: number;
  data: NodeNotifyNumberData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  connectionWhatsId: number;
  nodeId: string;
}

const findVariablesOnContactWA = async (
  contactsWAOnAccountId: number
): Promise<
  {
    value: string;
    name: string;
  }[]
> => {
  const variables = await prisma.contactsWAOnAccountVariableOnBusiness.findMany(
    {
      where: { contactsWAOnAccountId },
      select: {
        value: true,
        VariableOnBusiness: {
          select: {
            Variable: {
              select: { name: true },
            },
          },
        },
      },
    }
  );
  return variables.map((v) => ({
    name: v.VariableOnBusiness.Variable.name,
    value: v.value,
  }));
};

export const NodeNotifyNumber = (
  props: PropsNodeNotifyNumber
): Promise<void> => {
  return new Promise(async (res, rej) => {
    const numbersSend = props.data.numbers.map(({ number }) =>
      number.replace("+", "")
    );
    const thereVariable: boolean = !!props.data.text.match(/{{\w+}}/g);
    let variables: { name: string; value: string }[] = [];

    if (thereVariable) {
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
          value: leadInfo?.name ?? "SEM NOME",
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

    let newMessage = structuredClone(props.data.text);
    for await (const variable of variables) {
      const regex = new RegExp(`({{${variable.name}}})`, "g");
      newMessage = newMessage.replace(regex, variable.value);
    }

    for await (const number of numbersSend) {
      const newNumber = validatePhoneNumber(number, { removeNine: true });
      if (newNumber) {
        try {
          await TypingDelay({
            delay: 2,
            toNumber: newNumber + "@s.whatsapp.net",
            connectionId: props.connectionWhatsId,
          });

          await SendMessageText({
            connectionId: props.connectionWhatsId,
            text: newMessage,
            toNumber: newNumber + "@s.whatsapp.net",
          });
        } catch (error) {
          return rej();
        }
      }
    }

    res();
    return;
  });
};
