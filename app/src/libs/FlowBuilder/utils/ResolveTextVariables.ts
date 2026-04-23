import moment from "moment-timezone";
import { prisma } from "../../../adapters/Prisma/client";

interface IProps {
  text: string;
  accountId: number;
  contactsWAOnAccountId?: number;
  ticketProtocol?: string;
  numberLead?: string;
  nodeId?: string;
}

export async function resolveTextVariables(
  props: IProps,
  options?: { name: string; value: string | null }[],
  optionsTemp?: { name: string; value: string }[],
): Promise<string> {
  let newMessage = structuredClone(props.text || "");

  const hasVariable = newMessage.match(/{{\w+}}/g);

  if (hasVariable) {
    const now = moment().locale("pt-br").tz("America/Sao_Paulo");

    const sysAndCnt = await prisma.variable.findMany({
      where: {
        OR: [
          { type: "system" },
          { type: "constant", accountId: props.accountId },
        ],
        name: { in: hasVariable.map((s) => s.replace(/{{|}}/g, "")) },
      },
      select: { name: true, value: true },
    });

    const vSysAndCnt = await Promise.all(
      sysAndCnt.map(async (s) => {
        if (s.name === "JUN_DIA_DA_SEMANA") s.value = now.format("dddd");
        if (s.name === "JUN_NOME_MES_ATUAL") s.value = now.format("MMMM");
        if (s.name === "JUN_ANO_ATUAL") s.value = now.format("YYYY");
        if (s.name === "JUN_MES_ATUAL") s.value = now.format("MM");
        if (s.name === "JUN_DIA_ATUAL") s.value = now.format("DD");
        if (s.name === "JUN_DATA_ATUAL") s.value = now.format("DD/MM/YYYY");
        if (s.name === "JUN_HORARIO_ATUAL") s.value = now.format("HH:mm");
        if (s.name === "JUN_MINUTOS_ATUAL") s.value = now.format("mm");
        if (s.name === "JUN_HORAS_ATUAL") s.value = now.format("HH");
        if (s.name === "JUN_SEGUNDOS_ATUAL") s.value = now.format("ss");
        if (s.name === "JUN_TICKET_PROTOCOL" && props.ticketProtocol) {
          s.value = props.ticketProtocol;
        }
        if (s.name === "JUN_NODE_ID" && props.nodeId) s.value = props.nodeId;
        if (s.name === "JUN_SAUDACAO") {
          const hora = now.hour();
          if (hora < 12) {
            s.value = "Bom dia";
          } else if (hora < 18) {
            s.value = "Boa tarde";
          } else {
            s.value = "Boa noite";
          }
        }
        if (s.name === "JUN_LINK_START_CHAT_WHATSAPP") {
          s.value = "https://wa.me/";
        }
        if (s.name === "JUN_LINK_LEAD_WHATSAPP") {
          s.value = `https://wa.me/${props.numberLead}/`;
        }
        if (s.name === "JUN_NUMERO_LEAD_WHATSAPP" && props.numberLead) {
          const ff = await prisma.contactsWAOnAccount.findFirst({
            where: { id: props.contactsWAOnAccountId },
            select: { ContactsWA: { select: { realNumber: true } } },
          });
          if (ff?.ContactsWA.realNumber) {
            s.value = ff?.ContactsWA.realNumber
              .split("@")[0]
              .replace(/^55/, "");
          } else {
            s.value = props.numberLead.split("@")[0].replace(/^55/, "");
          }
        }
        if (
          s.name === "JUN_NOME_LEAD_WHATSAPP" &&
          props.contactsWAOnAccountId
        ) {
          const ff = await prisma.contactsWAOnAccount.findFirst({
            where: { id: props.contactsWAOnAccountId },
            select: { name: true },
          });
          if (ff?.name) s.value = ff.name;
        }

        return s;
      }),
    );

    if (options?.length) vSysAndCnt.push(...options);

    for await (const variable of vSysAndCnt) {
      const regex = new RegExp(`({{${variable.name}}})`, "g");
      if (variable.value)
        newMessage = newMessage.replace(regex, variable.value);
    }

    if (props.contactsWAOnAccountId) {
      const varsContact = await prisma.contactsWAOnAccountVariable.findMany({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          Variable: {
            name: { in: hasVariable.map((s) => s.replace(/{{|}}/g, "")) },
          },
        },
        select: { value: true, Variable: { select: { name: true } } },
      });

      for await (const variable of varsContact) {
        if (variable.value) {
          const regex = new RegExp(`({{${variable.Variable.name}}})`, "g");
          newMessage = newMessage.replace(regex, variable.value);
        }
      }
    }
  }

  const hasVariableTemp = newMessage.match(/\$\.\w+/g);

  if (hasVariableTemp && optionsTemp?.length) {
    const list: { name: string; value: string }[] = optionsTemp;

    for await (const varTemp of list) {
      const regex = new RegExp(`(\$\.${varTemp.name})`, "g");
      if (varTemp.value) {
        newMessage = newMessage.replace(regex, varTemp.value);
      }
    }
  }

  return newMessage;
}
