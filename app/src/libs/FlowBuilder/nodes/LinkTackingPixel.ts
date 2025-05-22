import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { createTokenAuth } from "../../../helpers/authToken";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeLinkTackingPixelData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";

interface PropsNodeLinkTackingPixel {
  numberLead: string;
  campaignId?: number;
  contactsWAOnAccountId: number;
  flowId: string;
  flowStateId: number;
  accountId: number;
  connectionWhatsId: number;
  data: NodeLinkTackingPixelData;
  businessName: string;
  ticketProtocol?: string;
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

export const NodeLinkTackingPixel = (
  props: PropsNodeLinkTackingPixel
): Promise<void> => {
  return new Promise(async (res, rej) => {
    try {
      const linkTackingPixel = await prisma.linkTrackingPixel.findUnique({
        where: { id: props.data.linkTackingPixelId },
        select: { link: true },
      });
      if (!linkTackingPixel) return rej("1");
      const auth = await prisma.contactsWAOnAccount.findFirst({
        where: { id: props.contactsWAOnAccountId },
        select: {
          Account: {
            select: {
              id: true,
              AccountAuthorization: {
                select: {
                  privateKey: true,
                },
              },
            },
          },
        },
      });

      if (!auth || !auth.Account.AccountAuthorization) return rej("2");

      const tokenCode = await createTokenAuth(
        {
          id: auth.Account.id,
          type: "api",
          flowId: props.flowId,
          flowStateId: props.flowStateId,
          linkTrackingPixelId: props.data.linkTackingPixelId,
          campaignId: props.campaignId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          connectionWhatsId: props.connectionWhatsId,
        },
        // auth.Account.AccountAuthorization.privateKey
        "secret123"
      );

      let newLink = "";
      if (linkTackingPixel.link.includes("?")) {
        newLink = linkTackingPixel.link + `&w=${encodeURIComponent(tokenCode)}`;
      } else {
        newLink = linkTackingPixel.link + `?w=${encodeURIComponent(tokenCode)}`;
      }

      let variables: { name: string; value: string }[] = [];
      const thereVariable: boolean = !!props.data.text.match(/{{\w+}}/g);

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

        const outhersVARS = [
          {
            name: "SYS_NOME_NO_WHATSAPP",
            value: leadInfo?.name ?? "SEM NOME",
          },
          {
            name: "SYS_NUMERO_LEAD_WHATSAPP",
            value: leadInfo?.ContactsWA.completeNumber ?? "SEM NÚMERO",
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

      let newRawText = structuredClone(props.data.text);
      if (thereVariable) {
        for await (const variable of variables) {
          const regex = new RegExp(`({{${variable.name}}})`, "g");
          newRawText = newRawText.replace(
            regex,
            encodeURIComponent(variable.value)
          );
        }
      }
      newRawText = newRawText.replace("{link}", newLink);

      try {
        await TypingDelay({
          delay: Number(props.data.interval),
          toNumber: props.numberLead,
          connectionId: props.connectionWhatsId,
        });
      } catch (error) {
        rej(error);
      }

      try {
        await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: newRawText,
          toNumber: props.numberLead,
        });
        res();
      } catch (error) {
        rej(error);
      }
    } catch (error) {
      console.log(error);
    }
    return;
  });
};
