import { prisma } from "../../../adapters/Prisma/client";
import { Trello } from "../../../adapters/Trello";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeNewCardTrelloData } from "../Payload";
import phone from "libphonenumber-js";

interface PropsNodeMessage {
  contactsWAOnAccountId?: number;
  data: NodeNewCardTrelloData;
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

export const NodeNewCardTrello = (props: PropsNodeMessage): Promise<void> => {
  return new Promise(async (res, rej) => {
    const thereVarName: boolean = !!props.data.name.match(/{{\w+}}/g);
    const thereVarDesc: boolean = !!props.data.desc?.match(/{{\w+}}/g);

    let variables: { name: string; value: string }[] = [];
    let accountId: null | number = null;

    if (!props.contactsWAOnAccountId) {
      return rej();
    }

    const data = await prisma.account.findFirst({
      where: {
        ContactsWAOnAccount: { some: { id: props.contactsWAOnAccountId } },
      },
      select: { id: true },
    });

    if (data?.id) {
      accountId = data.id;
    } else {
      return rej();
    }

    if (thereVarDesc || thereVarName) {
      const dataVar = await findVariablesOnContactWA(
        props.contactsWAOnAccountId
      );
      if (dataVar) {
        const findVarConst = await prisma.variable.findMany({
          where: { accountId },
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
        variables = [...dataVar, ...varConst, ...varsSystem, ...outhersVARS];
      }
    }
    if (!accountId) return rej();
    let newName = structuredClone(props.data.name);
    for await (const variable of variables) {
      const regex = new RegExp(`({{${variable.name}})`, "g");
      newName = newName.replace(regex, variable.value);
    }
    let newDesc = thereVarDesc ? structuredClone(props.data.desc) : undefined;
    if (newDesc) {
      for await (const variable of variables) {
        const regex = new RegExp(`({{${variable.name}})`, "g");
        newDesc = newDesc.replace(regex, variable.value);
      }
    }
    const fetchIntegration = await prisma.integrations.findFirst({
      where: { accountId, type: "trello", id: props.data.integrationId },
      select: { key: true, token: true },
    });
    if (!fetchIntegration) return rej();
    const trello = new Trello(fetchIntegration.key!, fetchIntegration.token!);
    try {
      console.log({ newDesc });
      const { id } = await trello.createCard({
        ...props.data,
        name: newName,
        ...(newDesc && { desc: newDesc }),
      });
      prisma.cardsTrello.create({
        data: { cardId: id, accountId },
      });
    } catch (error) {
      console.log(error);
      return rej();
    }

    return res();
  });
};
