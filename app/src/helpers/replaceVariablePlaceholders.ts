import { prisma } from "../adapters/Prisma/client";
import { getVariableSystem } from "../libs/VariablesSystem";

const findConstVars = async (businessIds: number[]) => {
  return await prisma.variable.findMany({
    where: {
      VariableOnBusiness: { some: { businessId: { in: businessIds } } },
      type: "constant",
    },
    select: { name: true, value: true },
  });
};

export const replaceVariablePlaceholders = (
  text: string
): {
  ah: (ticketId: number) => Promise<string>;
  adm: (contactId: number, businessIds: number[]) => Promise<string>;
} => {
  const variables: { name: string; value: string }[] = [];
  const systemVars = getVariableSystem().map(({ id, ...s }) => s);
  variables.push(...systemVars);

  return {
    ah: async (ticketId: number) => {
      const leadInfoTicket = await prisma.tickets.findFirst({
        where: { id: ticketId },
        select: {
          Business: { select: { id: true, name: true } },
          protocol: true,
          contactsWAOnAccountId: true,
          ContactsWAOnAccount: {
            select: {
              name: true,
              ContactsWA: { select: { completeNumber: true } },
              accountId: true,
            },
          },
        },
      });

      if (leadInfoTicket) {
        const findVarConst = await findConstVars([leadInfoTicket.Business.id]);

        const outhersVARS = [
          {
            name: "SYS_NOME_NO_WHATSAPP",
            value: leadInfoTicket.ContactsWAOnAccount.name ?? "SEM NOME",
          },
          {
            name: "SYS_NUMERO_LEAD_WHATSAPP",
            value:
              leadInfoTicket.ContactsWAOnAccount.ContactsWA.completeNumber ??
              "SEM NÚMERO",
          },
          {
            name: "SYS_LINK_WHATSAPP_LEAD",
            value: `https://wa.me/${leadInfoTicket.ContactsWAOnAccount.ContactsWA.completeNumber}`,
          },
          {
            name: "SYS_PROTOCOLO_DE_ATENDIMENTO",
            value:
              leadInfoTicket.protocol || "{{SYS_PROTOCOLO_DE_ATENDIMENTO}}",
          },
          {
            name: "SYS_BUSINESS_NAME",
            value: leadInfoTicket.Business.name || "{{SYS_BUSINESS_NAME}}",
          },
        ];

        const findDynamicVars =
          await prisma.contactsWAOnAccountVariableOnBusiness.findMany({
            where: {
              contactsWAOnAccountId: leadInfoTicket.contactsWAOnAccountId,
              VariableOnBusiness: { businessId: leadInfoTicket.Business.id },
            },
            select: {
              value: true,
              VariableOnBusiness: {
                select: { Variable: { select: { name: true } } },
              },
            },
          });

        const dynamicVars = findDynamicVars.map((s) => ({
          name: s.VariableOnBusiness.Variable.name,
          value: s.value,
        }));

        variables.push(
          ...outhersVARS,
          ...(findVarConst as { name: string; value: string }[]),
          ...dynamicVars
        );
      }

      let newMessage = structuredClone(text);
      for await (const variable of variables) {
        const regex = new RegExp(`({{${variable.name}}})`, "g");
        newMessage = newMessage.replace(regex, variable.value);
      }

      return newMessage;
    },
    adm: async () => {
      let newMessage = structuredClone(text);
      for await (const variable of variables) {
        const regex = new RegExp(`({{${variable.name}}})`, "g");
        newMessage = newMessage.replace(regex, variable.value);
      }
      return newMessage;
    },
  };
};
