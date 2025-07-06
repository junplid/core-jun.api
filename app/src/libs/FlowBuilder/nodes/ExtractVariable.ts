import { prisma } from "../../../adapters/Prisma/client";
import { NodeExtractVariableData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

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
    console.log("1");
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
    console.log("2");
    const source = await prisma.variable.findFirst({
      where: { id: data.var2Id, accountId: props.accountId },
      select: {
        ContactsWAOnAccountVariable: {
          where: { contactsWAOnAccountId: props.contactsWAOnAccountId },
          select: { id: true, value: true },
        },
      },
    });
    console.log("3");
    if (!target || !source) return;
    console.log("4");

    let targetValue: string = "";
    console.log("5");

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

    console.log("6");

    const flags = data.flags?.length ? data.flags.join("") : undefined;
    const regex = new RegExp(`${data.regex}`, flags);
    const valueResolved = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: data.value,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });
    console.log("7", { regex, valueResolved, targetValue });

    const nextValue = targetValue.replace(regex, valueResolved);
    console.log("8");

    if (!source.ContactsWAOnAccountVariable.length) {
      await prisma.contactsWAOnAccountVariable.create({
        data: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: data.var2Id,
          value: nextValue,
        },
      });
    } else {
      if (source.ContactsWAOnAccountVariable[0].value === nextValue) return;
      await prisma.contactsWAOnAccountVariable.update({
        where: { id: source.ContactsWAOnAccountVariable[0].id },
        data: { value: nextValue },
      });
    }
    console.log("9");

    return;
  } catch (e) {
    console.error("Error in NodeExtractVariable:", e);
    return;
  }
};
