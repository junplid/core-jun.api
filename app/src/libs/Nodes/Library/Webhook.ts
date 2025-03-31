import axios from "axios";
import json5 from "json5";
import { prisma } from "../../../adapters/Prisma/client";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeWebhookData } from "../Payload";
import phone from "libphonenumber-js";
interface PropsNodeWebhook {
  data: NodeWebhookData;
  contactsWAOnAccountId: number;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
}

interface Variable {
  value: string;
  name: string;
}

const findVariablesOnContactWA = async (
  contactsWAOnAccountId: number
): Promise<Variable[]> => {
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

const addToVariable = async (props: {
  variableId: number;
  contactsWAOnAccountId: number;
  value: string;
}) => {
  const businessIdsOnVariable = await prisma.variableOnBusiness.findMany({
    where: { variableId: props.variableId },
    select: {
      id: true,
      ContactsWAOnAccountVariableOnBusiness: { select: { id: true } },
    },
  });
  for await (const {
    ContactsWAOnAccountVariableOnBusiness,
    id,
  } of businessIdsOnVariable) {
    const variableOnBusinessId = id;
    if (!ContactsWAOnAccountVariableOnBusiness.length) {
      await prisma.contactsWAOnAccountVariableOnBusiness.create({
        data: {
          value: props.value,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableOnBusinessId,
        },
      });
    } else {
      ContactsWAOnAccountVariableOnBusiness.forEach(async (id) => {
        await prisma.contactsWAOnAccountVariableOnBusiness
          .upsert({
            where: id,
            create: {
              value: props.value,
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableOnBusinessId,
            },
            update: {
              value: props.value,
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableOnBusinessId,
            },
          })
          .catch((err) => console.log("ERROR VARIAVEL", err));
      });
    }
  }
};

const onThereVariable = (t?: string) => {
  return !!t?.match(/{{\w+}}/g);
};

const onUpdateString = async (
  variables: Variable[],
  t: string
): Promise<string | undefined> => {
  if (t) {
    let newMessage = structuredClone(t);
    for await (const variable of variables) {
      const regex = new RegExp(`({{${variable.name}}})`, "g");
      newMessage = newMessage.replace(regex, variable.value);
    }
    return newMessage;
  }
  return t;
};

export const NodeWebhook = (props: PropsNodeWebhook): Promise<void> => {
  return new Promise(async (res, rej) => {
    const { contactsWAOnAccountId, data } = props;

    let alreadyExistsVarHeaders = false;

    if (props.data.isHeaders) {
      alreadyExistsVarHeaders = data.headers.some((h) =>
        onThereVariable(h.value)
      );
    }

    const alreadyExistsVarUrl = onThereVariable(data.url);

    let alreadyExistsVarBody: boolean = false;
    if (data.method !== "get") {
      alreadyExistsVarBody = onThereVariable(data.body);
    }

    let variables: Variable[] = [];

    if (
      alreadyExistsVarHeaders ||
      alreadyExistsVarUrl ||
      alreadyExistsVarBody
    ) {
      variables = await findVariablesOnContactWA(contactsWAOnAccountId);
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

    if (variables.length) {
      const nextHeaders = await Promise.all(
        data.headers.map(async ({ key, value }) => ({
          [key]: await onUpdateString(variables, value),
        }))
      );

      const newUrl = await onUpdateString(variables, data.url);
      if (data.method !== "get") {
        let newBody = undefined;
        if (data.body) {
          newBody = await onUpdateString(variables, data.body);
        }
        const { data: dataRes } = await axios[data.method](
          newUrl!,
          newBody ? json5.parse(newBody) : undefined,
          {
            ...(nextHeaders.length && {
              headers: nextHeaders.reduce((acc, obj) => {
                return { ...acc, ...obj };
              }, {}),
            }),
          }
        );

        if (props.data.variableId) {
          await addToVariable({
            value: JSON.stringify(dataRes),
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.variableId,
          });
          await new Promise((s) => setTimeout(s, 3000));
        }
        res();
        return;
      }
      const { data: dataRes } = await axios[data.method](newUrl!, {
        ...(nextHeaders && {
          headers: nextHeaders.reduce((acc, obj) => {
            return { ...acc, ...obj };
          }, {}),
        }),
      });
      if (props.data.variableId) {
        await addToVariable({
          value: JSON.stringify(dataRes),
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.variableId,
        });
        await new Promise((s) => setTimeout(s, 3000));
      }
      res();
      return;
    } else {
      const nextHeaders = data.headers.map(({ key, value }) => ({
        [key]: value,
      }));

      if (data.method !== "get") {
        const { data: dataRes } = await axios[data.method](
          data.url,
          data.body ? json5.parse(data.body) : undefined,
          {
            ...(data.headers.length && {
              headers: nextHeaders.reduce((acc, obj) => {
                return { ...acc, ...obj };
              }, {}),
            }),
          }
        );
        if (props.data.variableId) {
          await addToVariable({
            value: JSON.stringify(dataRes),
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.variableId,
          });
          await new Promise((s) => setTimeout(s, 3000));
        }
        res();
        return;
      }
      const { data: dataRes } = await axios[data.method](data.url!, {
        ...(data.headers.length && {
          headers: nextHeaders.reduce((acc, obj) => {
            return { ...acc, ...obj };
          }, {}),
        }),
      });
      if (props.data.variableId) {
        await addToVariable({
          value: JSON.stringify(dataRes),
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.variableId,
        });
        await new Promise((s) => setTimeout(s, 3000));
      }
      res();
      return;
    }
  });
};
