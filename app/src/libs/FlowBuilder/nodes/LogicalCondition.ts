import phone from "libphonenumber-js";
import moment from "moment-timezone";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeLogicalConditionData } from "../Payload";
import { getVariableSystem } from "../../VariablesSystem";

interface PropsNodeLogicalCondition {
  data: NodeLogicalConditionData;
  flowStateId: number;
  nodeId: string;
  contactsWAOnAccountId: number;
  accountId: number;
}

function isRegEx(input: string) {
  try {
    const escapedRegexString = input.replace(/\\/g, "\\\\");
    new RegExp(escapedRegexString);
    return true;
  } catch (e) {
    return false;
  }
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

const daysOfTheWeek: {
  [x: number]: "dom" | "seg" | "ter" | "sab" | "qui" | "qua" | "sex";
} = {
  0: "dom",
  1: "seg",
  2: "ter",
  3: "qua",
  4: "qui",
  5: "sex",
  6: "sab",
};

async function getContactAccountId(
  flowStateId: number
): Promise<number | null> {
  try {
    const flowState = await prisma.flowState.findFirst({
      where: { id: flowStateId },
      select: {
        ContactsWAOnAccountOnAudience: {
          select: { contactWAOnAccountId: true },
        },
        contactsWAOnAccountId: true,
      },
    });
    return (
      flowState?.ContactsWAOnAccountOnAudience?.contactWAOnAccountId ||
      flowState?.contactsWAOnAccountId ||
      null
    );
  } catch (error) {
    return null;
  }
}

export const NodeLogicalCondition = (
  props: PropsNodeLogicalCondition
): Promise<"every" | "some" | "all-deny" | null> =>
  new Promise(async (res, rej) => {
    const { data } = props;

    let resumConditions: (string | boolean)[][] = [[]];

    let infoCurrentCondition: { index: number; type: null | "and" | "or" } = {
      index: 0,
      type: null,
    };

    const run = async (targetCondition: string): Promise<void> => {
      const currentCondition = data.conditions.find((cd) => {
        return cd.key === targetCondition;
      });
      console.log({ currentCondition });
      if (!currentCondition) return rej("1");

      const nextCondition = data.middlewares.find((mdd) => {
        if (mdd.source) return mdd.target === currentCondition.key;
      });

      if (targetCondition === "0") {
        infoCurrentCondition.type = nextCondition?.type ?? null;
      }

      if (currentCondition.type === "has-tag") {
        const contactId = await getContactAccountId(props.flowStateId);

        if (contactId === null) {
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(false);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([false, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(false);
            const newResumCondition: boolean[] = resumConditions.map(
              (e): boolean => {
                const expression = e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim();
                try {
                  console.log("has-tag ====== ", { expression });
                  return !!eval(expression);
                } catch (error) {
                  console.log("has-tag ====== ", { expression });
                  console.log("has-tag ====== expreção invalida");
                  return false;
                }
              }
            );

            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");
            return rej("2");
          }
        }

        const contactWAHasTag: boolean =
          !!(await prisma.tagOnBusinessOnContactsWAOnAccount.count({
            where: {
              tagOnBusinessId: currentCondition.tagOnBusinessId,
              contactsWAOnAccountId: contactId,
            },
          }));

        if (nextCondition) {
          if (
            targetCondition === "0" ||
            nextCondition.type === infoCurrentCondition.type
          ) {
            resumConditions[infoCurrentCondition.index].push(contactWAHasTag);
            resumConditions[infoCurrentCondition.index].push(
              nextCondition.type
            );
          } else {
            resumConditions.push([contactWAHasTag, nextCondition.type]);
            infoCurrentCondition.index++;
          }
          return run(nextCondition.source);
        } else {
          resumConditions[infoCurrentCondition.index].push(contactWAHasTag);
          const newResumCondition: boolean[] = resumConditions.map((e) => {
            const expression = e
              .join(" ")
              .replace(/and/g, "&&")
              .replace(/or/g, "||")
              .trim()
              .replace(/(\|\||&&)$/, "")
              .trim();
            try {
              return eval(expression);
            } catch (error) {
              return false;
            }
          });

          if (newResumCondition.every((v) => v)) return res("every");
          if (newResumCondition.some((v) => v)) return res("some");
          if (newResumCondition.every((v) => !v)) return res("all-deny");
          return rej("3");
        }
      }

      if (currentCondition.type === "system-variable") {
        if (currentCondition.variable === "hour") {
          const currentTimeTZ = moment().tz("America/Sao_Paulo");
          const start = moment()
            .tz("America/Sao_Paulo")
            .set({
              hour: Number(currentCondition.valueOne.split(":")[0]),
              minute: Number(currentCondition.valueOne.split(":")[1]),
            });
          const end = moment()
            .tz("America/Sao_Paulo")
            .set({
              hour: Number(currentCondition.valueTwo.split(":")[0]),
              minute: Number(currentCondition.valueTwo.split(":")[1]),
            });
          const isTrue = currentTimeTZ.isBetween(start, end);

          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isTrue);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isTrue, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isTrue);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });

            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");
            return rej("4");
          }
        }

        if (currentCondition.variable === "day-of-week") {
          const currentDayOfWeek = daysOfTheWeek[moment().day()];
          const isEqualDay = currentCondition.value === currentDayOfWeek;
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isEqualDay);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isEqualDay, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isEqualDay);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              const expression = e
                .join(" ")
                .replace(/and/g, "&&")
                .replace(/or/g, "||")
                .trim()
                .replace(/(\|\||&&)$/, "")
                .trim();
              return eval(expression);
            });

            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");
            return rej("5");
          }
        }
      }

      if (currentCondition.type === "text-variable") {
        const contactId = await getContactAccountId(props.flowStateId);

        if (contactId === null) {
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(false);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([false, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });

            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");
            return rej("6");
          }
        }

        const variable =
          await prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
            where: {
              // contactsWAOnAccountId: contactId,
              variableOnBusinessId: currentCondition.variableOnBusinessId,
            },
            select: { value: true },
          });

        if (!variable) {
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(false);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([false, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(false);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });

            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");
            return rej("7");
          }
        }

        if (currentCondition.run === "it-is") {
          if (currentCondition.precondition === "email") {
            const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(
              variable.value
            );

            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isEmail);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isEmail, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isEmail);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });

              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");
              return rej("8");
            }
          }
          if (currentCondition.precondition === "cep") {
            const isCep = /^[0-9]{5}(-|)[0-9]{3}$/.test(variable.value);
            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isCep);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isCep, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isCep);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("9");
            }
          }
          if (currentCondition.precondition === "phone") {
            const isIDD = variable.value.includes("+");
            const isPhone = !!phone(
              `${isIDD ? "" : "+55"}${variable.value}`
            )?.isValid();
            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isPhone);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isPhone, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isPhone);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");
              return rej("10");
            }
          }
          if (currentCondition.precondition === "date") {
            const isValid = moment(variable.value, "DD/MM/YYYY").isValid();
            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isValid);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isValid, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isValid);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });

              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");
              return rej("11");
            }
          }
          if (currentCondition.value) {
            let isValid = false;
            const isregex = isRegEx(currentCondition.value);

            if (isregex) {
              const escapedRegexString = currentCondition.value.replace(
                /\\/g,
                "\\"
              );
              const regex = new RegExp(escapedRegexString);
              isValid = regex.test(variable.value);
            } else {
              const thereVariable: boolean =
                !!currentCondition.value.match(/{{\w+}}/g);
              let variables: { name: string; value: string }[] = [];
              if (thereVariable) {
                variables = await findVariablesOnContactWA(
                  props.contactsWAOnAccountId
                );
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
                    name: "SYS_LINK_WHATSAPP_LEAD",
                    value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
                  },
                ];
                variables = [
                  ...variables,
                  ...varConst,
                  ...varsSystem,
                  ...outhersVARS,
                ];

                let nextValue = structuredClone(currentCondition.value);
                for await (const variable of variables) {
                  const regex = new RegExp(`({{${variable.name}}})`, "g");
                  nextValue = nextValue.replace(regex, variable.value);
                }

                isValid = variable.value.includes(nextValue);
              } else {
                isValid = currentCondition.value === variable.value;
              }
            }

            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isValid);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isValid, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isValid);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("16");
            }
          }
        }

        if (currentCondition.run === "its-not") {
          if (currentCondition.precondition === "email") {
            const isEmail = !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(
              variable.value
            );

            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isEmail);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isEmail, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isEmail);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("12");
            }
          }
          if (currentCondition.precondition === "cep") {
            const isCep = !/^[0-9]{5}(-|)[0-9]{3}$/.test(variable.value);
            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isCep);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isCep, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isCep);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("13");
            }
          }
          if (currentCondition.precondition === "phone") {
            const isIDD = variable.value.includes("+");
            const isPhone = !phone(
              `${isIDD ? "" : "+55"}${variable.value}`
            )?.isValid();

            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isPhone);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isPhone, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isPhone);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("14");
            }
          }
          if (currentCondition.precondition === "date") {
            const isValid = !moment(variable.value, "DD/MM/YYYY").isValid();
            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isValid);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isValid, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isValid);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("15");
            }
          }
          if (currentCondition.value) {
            let isValid = false;
            const isregex = isRegEx(currentCondition.value);

            if (isregex) {
              const escapedRegexString = currentCondition.value.replace(
                /\\/g,
                "\\"
              );
              const regex = new RegExp(escapedRegexString);
              isValid = !regex.test(variable.value);
            } else {
              const thereVariable: boolean =
                !!currentCondition.value.match(/{{\w+}}/g);
              let variables: { name: string; value: string }[] = [];
              if (thereVariable) {
                variables = await findVariablesOnContactWA(
                  props.contactsWAOnAccountId
                );
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
                    name: "SYS_LINK_WHATSAPP_LEAD",
                    value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
                  },
                ];
                variables = [
                  ...variables,
                  ...varConst,
                  ...varsSystem,
                  ...outhersVARS,
                ];

                let nextValue = structuredClone(currentCondition.value);
                for await (const variable of variables) {
                  const regex = new RegExp(`({{${variable.name}}})`, "g");
                  nextValue = nextValue.replace(regex, variable.value);
                }

                isValid = !variable.value.includes(nextValue);
              } else {
                isValid = currentCondition.value !== variable.value;
              }
            }

            if (nextCondition) {
              if (
                targetCondition === "0" ||
                nextCondition.type === infoCurrentCondition.type
              ) {
                resumConditions[infoCurrentCondition.index].push(isValid);
                resumConditions[infoCurrentCondition.index].push(
                  nextCondition.type
                );
              } else {
                resumConditions.push([isValid, nextCondition.type]);
                infoCurrentCondition.index++;
              }
              return run(nextCondition.source);
            } else {
              resumConditions[infoCurrentCondition.index].push(isValid);
              const newResumCondition: boolean[] = resumConditions.map((e) => {
                return eval(
                  e
                    .join(" ")
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")
                    .trim()
                    .replace(/(\|\||&&)$/, "")
                    .trim()
                );
              });
              if (newResumCondition.every((v) => v)) return res("every");
              if (newResumCondition.some((v) => v)) return res("some");
              if (newResumCondition.every((v) => !v)) return res("all-deny");

              return rej("16");
            }
          }
          return;
        }

        if (currentCondition.run === "contains") {
          let isValid = false;

          const thereVariable: boolean =
            !!currentCondition.value.match(/{{\w+}}/g);
          let variables: { name: string; value: string }[] = [];
          if (thereVariable) {
            variables = await findVariablesOnContactWA(
              props.contactsWAOnAccountId
            );
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
                name: "SYS_LINK_WHATSAPP_LEAD",
                value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
              },
            ];
            variables = [
              ...variables,
              ...varConst,
              ...varsSystem,
              ...outhersVARS,
            ];

            let nextValue = structuredClone(currentCondition.value);
            for await (const variable of variables) {
              const regex = new RegExp(`({{${variable.name}}})`, "g");
              nextValue = nextValue.replace(regex, variable.value);
            }

            isValid = variable.value.includes(nextValue);
          } else {
            isValid = variable.value.includes(currentCondition.value);
          }

          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isValid);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isValid, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isValid);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });
            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");

            return rej("16");
          }
        }
        if (currentCondition.run === "not-contain") {
          let isValid = false;
          const thereVariable: boolean =
            !!currentCondition.value.match(/{{\w+}}/g);
          let variables: { name: string; value: string }[] = [];
          if (thereVariable) {
            variables = await findVariablesOnContactWA(
              props.contactsWAOnAccountId
            );
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
                name: "SYS_LINK_WHATSAPP_LEAD",
                value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
              },
            ];
            variables = [
              ...variables,
              ...varConst,
              ...varsSystem,
              ...outhersVARS,
            ];
            let nextValue = structuredClone(currentCondition.value);
            for await (const variable of variables) {
              const regex = new RegExp(`({{${variable.name}}})`, "g");
              nextValue = nextValue.replace(regex, variable.value);
            }

            isValid = variable.value.includes(nextValue);
          } else {
            isValid = !variable.value.includes(currentCondition.value);
          }
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isValid);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isValid, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isValid);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });
            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");

            return rej("18");
          }
        }
        if (currentCondition.run === "is-empty") {
          const isValid = variable.value === "";
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isValid);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isValid, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isValid);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });
            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");

            return rej("19");
          }
        }
        if (currentCondition.run === "starts-with") {
          const thereVariable: boolean =
            !!currentCondition.value.match(/{{\w+}}/g);
          let variables: { name: string; value: string }[] = [];
          if (thereVariable) {
            variables = await findVariablesOnContactWA(
              props.contactsWAOnAccountId
            );
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
                name: "SYS_LINK_WHATSAPP_LEAD",
                value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
              },
            ];
            variables = [
              ...variables,
              ...varConst,
              ...varsSystem,
              ...outhersVARS,
            ];
          }

          let nextValue = structuredClone(currentCondition.value);
          for await (const variable of variables) {
            const regex = new RegExp(`({{${variable.name}}})`, "g");
            nextValue = nextValue.replace(regex, variable.value);
          }
          const regex = new RegExp(`^${nextValue}`);
          const isValid = regex.test(variable.value);

          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isValid);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isValid, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isValid);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });
            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");

            return rej("20");
          }
        }
        if (currentCondition.run === "end-with") {
          const thereVariable: boolean =
            !!currentCondition.value.match(/{{\w+}}/g);
          let variables: { name: string; value: string }[] = [];
          if (thereVariable) {
            variables = await findVariablesOnContactWA(
              props.contactsWAOnAccountId
            );
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
                name: "SYS_LINK_WHATSAPP_LEAD",
                value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
              },
            ];
            variables = [
              ...variables,
              ...varConst,
              ...varsSystem,
              ...outhersVARS,
            ];
          }

          let nextValue = structuredClone(currentCondition.value);
          for await (const variable of variables) {
            const regex = new RegExp(`({{${variable.name}}})`, "g");
            nextValue = nextValue.replace(regex, variable.value);
          }

          const regex = new RegExp(`${nextValue}$`);
          const isValid = regex.test(variable.value);

          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(isValid);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([isValid, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            resumConditions[infoCurrentCondition.index].push(isValid);
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });
            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");

            return rej("21");
          }
        }
        return;
      }

      if (currentCondition.type === "numeric-variable") {
        if (
          !currentCondition.variableId_B &&
          currentCondition.value === undefined
        ) {
          return rej("22");
        }

        const contactId = await getContactAccountId(props.flowStateId);

        if (contactId === null) {
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(false);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([false, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });
            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");

            return rej("23");
          }
        }

        const variable =
          await prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
            where: {
              contactsWAOnAccountId: contactId,
              VariableOnBusiness: { variableId: currentCondition.variableId_A },
            },
            select: { value: true },
          });
        if (!variable) {
          if (nextCondition) {
            if (
              targetCondition === "0" ||
              nextCondition.type === infoCurrentCondition.type
            ) {
              resumConditions[infoCurrentCondition.index].push(false);
              resumConditions[infoCurrentCondition.index].push(
                nextCondition.type
              );
            } else {
              resumConditions.push([false, nextCondition.type]);
              infoCurrentCondition.index++;
            }
            return run(nextCondition.source);
          } else {
            const newResumCondition: boolean[] = resumConditions.map((e) => {
              return eval(
                e
                  .join(" ")
                  .replace(/and/g, "&&")
                  .replace(/or/g, "||")
                  .trim()
                  .replace(/(\|\||&&)$/, "")
                  .trim()
              );
            });

            if (newResumCondition.every((v) => v)) return res("every");
            if (newResumCondition.some((v) => v)) return res("some");
            if (newResumCondition.every((v) => !v)) return res("all-deny");
            return rej("24");
          }
        }
        let variableTwo: number | null = null;
        variableTwo = Number(currentCondition.value);
        if (!!currentCondition.variableId_B) {
          const getVariableTwo =
            await prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
              where: {
                contactsWAOnAccountId: contactId,
                variableOnBusinessId: currentCondition.variableId_B,
              },
              select: { value: true },
            });
          if (getVariableTwo?.value) {
            variableTwo = Number(getVariableTwo.value);
          } else {
            rej("1041");
          }
        }
        let isValid: boolean | null = null;
        if (currentCondition.run === "equal") {
          isValid = Number(variable.value) === variableTwo;
        }
        if (currentCondition.run === "not-equal") {
          isValid = Number(variable.value) !== variableTwo;
        }
        if (currentCondition.run === "less-than") {
          isValid = Number(variable.value) < variableTwo;
        }
        if (currentCondition.run === "bigger-than") {
          isValid = Number(variable.value) > variableTwo;
        }
        if (currentCondition.run === "bigger-or-equal") {
          isValid = Number(variable.value) >= variableTwo;
        }
        if (currentCondition.run === "less-or-equal") {
          isValid = Number(variable.value) <= variableTwo;
        }
        if (nextCondition) {
          if (
            targetCondition === "0" ||
            nextCondition.type === infoCurrentCondition.type
          ) {
            resumConditions[infoCurrentCondition.index].push(!!isValid);
            resumConditions[infoCurrentCondition.index].push(
              nextCondition.type
            );
          } else {
            resumConditions.push([!!isValid, nextCondition.type]);
            infoCurrentCondition.index++;
          }
          return run(nextCondition.source);
        } else {
          resumConditions[infoCurrentCondition.index].push(!!isValid);
          const newResumCondition: boolean[] = resumConditions.map((e) => {
            return eval(
              e
                .join(" ")
                .replace(/and/g, "&&")
                .replace(/or/g, "||")
                .trim()
                .replace(/(\|\||&&)$/, "")
                .trim()
            );
          });
          if (newResumCondition.every((v) => v)) return res("every");
          if (newResumCondition.some((v) => v)) return res("some");
          if (newResumCondition.every((v) => !v)) return res("all-deny");
          return rej("25");
        }
      }
    };

    await run("0");
  });
