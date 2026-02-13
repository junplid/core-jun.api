import { prisma } from "../../../adapters/Prisma/client";
import { NodeIfData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeIf {
  data: NodeIfData;
  flowStateId: number;
  nodeId: string;
  contactAccountId: number;
  accountId: number;
  numberLead: string;
}

// const daysOfTheWeek: {
//   [x: number]: "dom" | "seg" | "ter" | "sab" | "qui" | "qua" | "sex";
// } = {
//   0: "dom",
//   1: "seg",
//   2: "ter",
//   3: "qua",
//   4: "qui",
//   5: "sex",
//   6: "sab",
// };

export const NodeIf = (props: PropsNodeIf): Promise<boolean> =>
  new Promise(async (res, _rej) => {
    const resumConditions: ("&&" | "||" | boolean)[] = [];

    if (!props.data.list?.length) return res(true);

    for await (const item of props.data.list) {
      if (item.name === "has-tags" || item.name === "no-tags") {
        const contactWAHasTag: boolean =
          (await prisma.tagOnContactsWAOnAccount.count({
            where: {
              tagId: { in: item.tagIds },
              contactsWAOnAccountId: props.contactAccountId,
            },
          })) === item.tagIds.length;

        if (item.name === "no-tags") {
          resumConditions.push(!contactWAHasTag);
        } else {
          resumConditions.push(contactWAHasTag);
        }
        resumConditions.push(item.operatorLogic);
        continue;
      }
      if (item.name === "var") {
        if (item.operatorComparison !== "regex") {
          const nextValue1 = await resolveTextVariables({
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactAccountId,
            text: item.value1,
            numberLead: props.numberLead,
            nodeId: props.nodeId,
          });
          const nextValue2 = await resolveTextVariables({
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactAccountId,
            text: item.value2,
            numberLead: props.numberLead,
            nodeId: props.nodeId,
          });

          if (item.operatorComparison === "===") {
            resumConditions.push(nextValue1 === nextValue2);
          } else if (item.operatorComparison === "!==") {
            resumConditions.push(nextValue1 !== nextValue2);
          } else if (item.operatorComparison === "[...]") {
            resumConditions.push(nextValue1.includes(nextValue2));
          } else {
            const isNaN1 = isNaN(Number(nextValue1));
            const isNaN2 = isNaN(Number(nextValue2));
            if (isNaN1 || isNaN2) {
              resumConditions.push(false);
            }
            if (item.operatorComparison === "<") {
              resumConditions.push(Number(nextValue1) < Number(nextValue2));
            }
            if (item.operatorComparison === ">") {
              resumConditions.push(Number(nextValue1) > Number(nextValue2));
            }
            if (item.operatorComparison === "<=") {
              resumConditions.push(Number(nextValue1) <= Number(nextValue2));
            }
            if (item.operatorComparison === ">=") {
              resumConditions.push(Number(nextValue1) <= Number(nextValue2));
            }
          }
          resumConditions.push(item.operatorLogic);
          continue;
        }

        try {
          const flags = item.flags?.length ? item.flags.join("") : undefined;
          const regex = new RegExp(`/${item.value2}/`, flags);
          const isValid = regex.test(item.value1);
          resumConditions.push(isValid, item.operatorLogic);
        } catch (e) {
          resumConditions.push(false, item.operatorLogic);
        }
        continue;
      }
    }

    try {
      const result = eval(
        resumConditions
          .join(" ")
          .trim()
          .replace(/(\|\||&&)$/, "")
          .trim(),
      );
      return res(result);
    } catch (error) {
      return res(false);
    }
  });
