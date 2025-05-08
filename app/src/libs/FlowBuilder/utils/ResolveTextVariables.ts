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

export async function resolveTextVariables(props: IProps): Promise<string> {
  const hasVariable = props.text.match(/{{\w+}}/g);
  if (!hasVariable) return props.text;

  const now = moment().locale("pt-br").tz("America/Sao_Paulo");

  const sysAndCnt = await prisma.variable.findMany({
    where: {
      accountId: props.accountId,
      type: { in: ["system", "constant"] },
      name: { in: hasVariable.map((s) => s.replace(/{{|}}/g, "")) },
    },
    select: { name: true, value: true },
  });

  const vSysAndCnt = sysAndCnt.map((s) => {
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
    // if (s.name === "JUN_NOME_LEAD_WHATSAPP") {
    // }

    return s;
  });

  let newMessage = structuredClone(props.text);
  for await (const variable of vSysAndCnt) {
    const regex = new RegExp(`({{${variable.name}}})`, "g");
    if (variable.value) newMessage = newMessage.replace(regex, variable.value);
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
      const regex = new RegExp(`({{${variable.Variable.name}}})`, "g");
      newMessage = newMessage.replace(regex, variable.value);
    }
  }

  return newMessage;
}
