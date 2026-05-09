import { prisma } from "../../../adapters/Prisma/client";
import { NodeExtractVariableData } from "../Payload";
import { localVariables } from "../utils/LocalVariables";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import RE2 from "re2";

interface PropsNodeExtractVariable {
  data: NodeExtractVariableData;
  nodeId: string;
  contactsWAOnAccountId: number;
  accountId: number;
  numberLead: string;
  keyControl: string;
}

export const NodeExtractVariable = async ({
  data,
  ...props
}: PropsNodeExtractVariable): Promise<void> => {
  try {
    let targetName = "";
    let sourceLocal = "";
    let sourceId: number | null = null;
    if (data.var1Id) {
      const target = await prisma.variable.findUnique({
        where: { id: data.var1Id },
        select: { name: true },
      });
      if (target?.name) targetName = `{{${target.name}}}`;
    }
    if (data.locale_var_name_var1) {
      targetName = `$.${data.locale_var_name_var1}`;
    }

    if (data.var2Id) {
      const source = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          variableId: data.var2Id,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
        },
        select: {
          id: true,
        },
      });
      if (source?.id) sourceId = source.id;
    }
    if (data.save_locale_var_name_var2Id) {
      sourceLocal = data.save_locale_var_name_var2Id;
    }

    if (!targetName || (!sourceLocal && !sourceId)) {
      return;
    }

    const targetValue = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: targetName,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
      keyControl: props.keyControl,
    });

    const flags = data.flags?.length ? data.flags.join("") : undefined;
    let regex: RE2;

    try {
      data.regex = await resolveTextVariables({
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        text: data.regex,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
        keyControl: props.keyControl,
      });
      regex = new RE2(data.regex, flags);
    } catch (err) {
      return;
    }
    const valueResolved = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: data.value || "",
      numberLead: props.numberLead,
      nodeId: props.nodeId,
      keyControl: props.keyControl,
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

      nextValue = resolveMatch(valueResolved || "");
    } else {
      nextValue = targetValue.replace(regex, valueResolved || "");
    }

    const nextValueResolved = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: nextValue,
      keyControl: props.keyControl,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });
    if (sourceLocal) {
      localVariables.upsert(props.keyControl, [sourceLocal, nextValueResolved]);
    }
    if (sourceId && data.var2Id) {
      await prisma.contactsWAOnAccountVariable.upsert({
        where: { id: sourceId },
        update: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: data.var2Id,
          value: nextValueResolved,
        },
        create: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: data.var2Id,
          value: nextValueResolved,
        },
      });
    }
    return;
  } catch (e) {
    console.error("Error in NodeExtractVariable:", e);
    return;
  }
};
