import { prisma } from "../../../adapters/Prisma/client";
import { NodeExtractVariableData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import RE2 from "re2";

interface PropsNodeExtractVariable {
  data: NodeExtractVariableData;
  nodeId: string;
  contactsWAOnAccountId: number;
  accountId: number;
  numberLead: string;
}

export const NodeExtractVariable = async ({
  data,
  ...props
}: PropsNodeExtractVariable): Promise<void> => {
  try {
    const target = await prisma.variable.findUnique({
      where: { id: data.var1Id },
      select: {
        name: true,
        ContactsWAOnAccountVariable: {
          where: { contactsWAOnAccountId: props.contactsWAOnAccountId },
          select: { value: true },
        },
      },
    });
    const source = await prisma.variable.findFirst({
      where: { id: data.var2Id, accountId: props.accountId },
      select: {
        ContactsWAOnAccountVariable: {
          where: { contactsWAOnAccountId: props.contactsWAOnAccountId },
          select: { id: true, value: true },
        },
      },
    });
    if (!target || !source) return;

    let targetValue: string = "";

    if (target.name) {
      targetValue = await resolveTextVariables({
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        text: `{{${target.name}}}`,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    } else if (target.ContactsWAOnAccountVariable?.[0]?.value) {
      targetValue = await resolveTextVariables({
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        text: target.ContactsWAOnAccountVariable?.[0]?.value,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    } else return;

    const flags = data.flags?.length ? data.flags.join("") : undefined;
    let regex: RE2;

    try {
      data.regex = await resolveTextVariables({
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        text: data.regex,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
      regex = new RE2(data.regex, flags);
    } catch (err) {
      return;
    }

    const valueResolved = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: data.value,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    let nextValue = "";

    if (!data.tools || data.tools === "match") {
      const match = targetValue.match(regex);
      function resolveMatch(model: string) {
        if (!match) return "";
        return model.replace(/\$\[(\d+)\]/g, (_, idx) => {
          const i = parseInt(idx, 10);
          return match[i] ?? "";
        });
      }

      nextValue = resolveMatch(valueResolved);
    } else {
      nextValue = targetValue.replace(regex, valueResolved);
    }

    const nextValueResolved = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: nextValue,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    if (!source.ContactsWAOnAccountVariable.length) {
      await prisma.contactsWAOnAccountVariable.create({
        data: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: data.var2Id,
          value: nextValueResolved,
        },
      });
    } else {
      if (source.ContactsWAOnAccountVariable[0].value === nextValueResolved)
        return;
      await prisma.contactsWAOnAccountVariable.update({
        where: { id: source.ContactsWAOnAccountVariable[0].id },
        data: { value: nextValueResolved },
      });
    }

    return;
  } catch (e) {
    console.error("Error in NodeExtractVariable:", e);
    return;
  }
};
