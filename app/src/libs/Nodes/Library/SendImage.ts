import { WASocket } from "baileys";
import { resolve } from "path";
import { prisma } from "../../../adapters/Prisma/client";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeSendImageData } from "../Payload";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendImage } from "../../../adapters/Baileys/modules/sendImage";
import { number } from "mathjs";
import phone from "libphonenumber-js";

interface PropsNodeReply {
  data: NodeSendImageData;
  numberLead: string;
  contactsWAOnAccountId: number;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
  connectionId: number;
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

export const NodeSendImage = (props: PropsNodeReply): Promise<void> =>
  new Promise(async (res, rej) => {
    const { data, numberLead } = props;

    let urlStatic: string | undefined = undefined;

    if (!data.linkImage && data.staticFileId) {
      const nameFile = await prisma.staticPaths.findFirst({
        where: { id: data.staticFileId },
        select: { name: true },
      });

      if (!nameFile) {
        console.log("chegou aqui");
        return rej();
      }

      urlStatic = resolve(
        __dirname,
        `../../../../static/image/${nameFile.name}`
      );
    }

    let newMessage = structuredClone(data.message);

    if (data.interval && newMessage) {
      const thereVariable: boolean = !!newMessage.match(/{{\w+}}/g);
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
      try {
        await TypingDelay({
          connectionId: props.connectionId,
          toNumber: numberLead,
          delay: data.interval,
        });
      } catch (error) {
        return rej();
      }
      for await (const variable of variables) {
        const regex = new RegExp(`({{${variable.name}}})`, "g");
        newMessage = newMessage.replace(regex, variable.value);
      }
    }

    if (!urlStatic && !data.linkImage) return rej();
    try {
      await SendImage({
        connectionId: props.connectionId,
        toNumber: numberLead,
        url: (data.linkImage || urlStatic) as string,
        caption: newMessage,
      });
    } catch (error) {
      return rej();
    }

    return res();
  });
