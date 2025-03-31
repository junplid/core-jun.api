import { evaluate } from "mathjs";
import moment from "moment-timezone";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeMathematicalOperatorsData } from "../Payload";

interface PropsNodeMathematicalOperators {
  data: NodeMathematicalOperatorsData;
  contactsWAOnAccountId: number;
  accountId: number;
  nodeId: string;
}

const daysOfTheWeek: { [x: number]: string } = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

const findVariablesOnContactWA = async (
  contactsWAOnAccountId: number,
  variablesNames: string[]
): Promise<{ [x: string]: string }> => {
  console.log({ contactsWAOnAccountId, variablesNames });
  const variables = await prisma.contactsWAOnAccountVariableOnBusiness.findMany(
    {
      where: {
        contactsWAOnAccountId,
        VariableOnBusiness: { Variable: { name: { in: variablesNames } } },
      },
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
  console.log(variables);
  const obj: { [x: string]: string } = {};
  variables.forEach((v) =>
    Object.assign(obj, { [v.VariableOnBusiness.Variable.name]: v.value })
  );
  return obj;
};

export const NodeMathematicalOperators = (
  props: PropsNodeMathematicalOperators
): Promise<void> =>
  new Promise(async (res, rej) => {
    // console.log("ENTROU NO OPERADOR MATEMATICO");
    const { data } = props;

    // console.log("DATA", data);

    const info: { [x: string]: string | number } = {
      VALOR_ATUAL: "",
      DATA_ATUAL: new Date().toLocaleDateString("pt-br"),
    };

    // console.log("INFO", info);

    const aggregationOperation = (): Promise<string> =>
      new Promise(async (resA, rejA) => {
        // talvez esse não seja a melhor maneira. foraech
        let i = 0;
        for await (const item of data.aggregation) {
          // console.log("ENTROU NO FOREACH: ", i);
          const vars = item.formula.match(/({{)\w+(}})/g);
          // const localVars = item.formula.match(/({)\w+(})/g);

          console.log({ vars });

          let nameVars: string[] | undefined = undefined;
          // let nameLocalVars: string[] | undefined = undefined;
          if (vars?.length) {
            // console.log("VARS", vars);
            const nameVarsFilter = vars?.filter(
              (vv) => !/DATA_ATUAL|VALOR_ATUAL/.test(vv)
            );
            nameVars = nameVarsFilter?.map((vv) =>
              vv.replace(/{{(\w+)}}/g, "$1")
            );
            console.log("NAMEVARS", nameVars);
          }
          // if (localVars?.length) {
          //   // console.log("VARS local", localVars);
          //   const nameVarsFilter = localVars?.filter((vv) =>
          //     /DATA_ATUAL|VALOR_ATUAL/.test(vv)
          //   );
          //   nameLocalVars = nameVarsFilter?.map((vv) =>
          //     vv.replace(/{(\w+)}/g, "$1")
          //   );
          //   console.log("NAMEVARS LOCAL", nameLocalVars);
          // }

          // console.log({ nameLocalVars, nameVars });

          let variables: { [x: string]: string } | undefined = undefined;
          if (nameVars?.length) {
            variables = await findVariablesOnContactWA(
              props.contactsWAOnAccountId,
              nameVars
            );
            // dps resolver isso aqui
            // const findVarConst = await prisma.variable.findMany({
            //   where: { accountId: props.accountId },
            //   select: { name: true, value: true },
            // });
            // const varConst = findVarConst.filter((s) => s.value && s) as {
            //   name: string;
            //   value: string;
            // }[];
            // const varsSystem = getVariableSystem();
            // variables = [...variables, ...varConst, ...varsSystem];
            // console.log("VARIABLES", variables);
          }
          // console.log({ variables });
          if (
            item.type === "mathematics" ||
            (item.type === "date" && !item.formula.includes("{DATA_ATUAL}"))
          ) {
            console.log("ENTROU NO IF: 88");
            if (!vars?.length) {
              // console.log("ENTROU NO IF: 90");
              let nextForm = "";
              const localVars = item.formula.match(/({)\w+(})/g);
              const nameVarsFilter = localVars?.filter((vv) =>
                /DATA_ATUAL|VALOR_ATUAL/.test(vv)
              );
              const nameLocalVars = nameVarsFilter?.map((vv) =>
                vv.replace(/{(\w+)}/g, "$1")
              );
              if (nameLocalVars?.includes("VALOR_ATUAL")) {
                nextForm = item.formula.replaceAll(
                  "{VALOR_ATUAL}",
                  String(info.VALOR_ATUAL)
                );
              } else {
                nextForm = item.formula;
              }
              // console.log({ nextForm });
              let vlTemp = evaluate(nextForm);
              if (item.run?.passToInt) vlTemp = vlTemp >> 0;
              if (item.run?.passToAbsolute) vlTemp = Math.abs(vlTemp);
              info.VALOR_ATUAL = vlTemp;
              // console.log("final do IF: 95");
            } else {
              console.log("ENTROU NO ELSE: 98");
              if (!variables || !Object.entries(variables).length) {
                return rej();
              }
              let newFormula = vars.reduce((ac, value) => {
                console.log({ value, variables });
                const varValue =
                  variables?.[value.replace(/{{(\w+)}}/g, "$1")] ??
                  info[value.replace(/{{(\w+)}}/g, "$1")];
                return ac.replace(
                  new RegExp(`${value}`, "g"),
                  String(varValue)
                );
              }, item.formula);
              console.log("NEWFORMULA: 164", newFormula);
              try {
                info.VALOR_ATUAL = evaluate(newFormula);
              } catch (error) {
                return rej();
              }
              // console.log("final do ELSE: 110");
            }
            // console.log("final do IF: 112");
            if (data.aggregation.length - 1 === i)
              resA(String(info.VALOR_ATUAL));
          } else {
            // console.log("ENTROU NO ELSE: 116");
            const isDate =
              vars?.length === 1 && moment.isDate(new Date(vars[0]));
            // console.log("ISDATE: 119", isDate);
            if (!vars?.length || !isDate) {
              // console.log("ENTROU NO IF: 121");
              try {
                info.VALOR_ATUAL = evaluate(item.formula);
              } catch (error) {
                return rej();
              }
            } else {
              let newFormula = vars.reduce((ac, value) => {
                const keyV = value.replace(/{(\w+)}/g, "$1");
                return ac.replace(
                  new RegExp(`(${value})`, "g"),
                  String(variables?.[keyV] ?? info[keyV])
                );
              }, item.formula);
              // console.log("NEWFORMULA: 131", newFormula);
              const nextFormula = newFormula.replace(
                new RegExp("{DATA_ATUAL}", "gi"),
                ""
              );
              // console.log("NEXTFORMULA: 136", nextFormula);
              const valueTmp = evaluate(nextFormula);
              const date = new Date();
              const nextDate = moment(date).add(valueTmp, "days").toDate();
              // console.log({
              //   date,
              //   nextDate,
              //   valueTmp,
              //   line: 144,
              // });
              if (item.run) {
                // console.log("ENTROU NO IF: 147");
                if (item.run.transformDateIntoDay) {
                  resA(daysOfTheWeek[moment(nextDate).day()]);
                }
                // console.log("ENTROU NO IF: 151");
                if (item.run.workingDays) {
                  let diasUteis = 0;
                  let dataAtual = moment(date);

                  while (
                    dataAtual.isBefore(nextDate) ||
                    dataAtual.isSame(nextDate, "day")
                  ) {
                    if (dataAtual.day() !== 0 && dataAtual.day() !== 6) {
                      diasUteis++;
                    }
                    dataAtual.add(1, "day");
                  }
                  info.VALOR_ATUAL = diasUteis;
                  // console.log("SAIU DO IF: 166");
                }
                if (item.run.pick === "day") {
                  // console.log("ENTROU NO IF: 169");
                  info.VALOR_ATUAL = nextDate.getDate();
                }
                if (item.run.pick === "month") {
                  // console.log("ENTROU NO IF: 173");
                  info.VALOR_ATUAL = nextDate.getMonth() + 1;
                }
                if (item.run.pick === "year") {
                  // console.log("ENTROU NO IF: 177");
                  info.VALOR_ATUAL = nextDate.getFullYear();
                }
                if (data.aggregation.length - 1 === i)
                  // console.log("SAIU DO IF: 181");
                  resA(String(info.VALOR_ATUAL));
              }
            }
          }
          i++;
        }
      });

    const newVar = await aggregationOperation();
    // console.log(newVar);

    const businessIdsOnVariable = await prisma.variableOnBusiness.findMany({
      where: { variableId: data.variableId },
      select: {
        id: true,
        ContactsWAOnAccountVariableOnBusiness: { select: { id: true } },
      },
    });

    businessIdsOnVariable.forEach(
      async ({
        id: variableOnBusinessId,
        ContactsWAOnAccountVariableOnBusiness,
      }) => {
        if (!ContactsWAOnAccountVariableOnBusiness.length) {
          // console.log("ENTROU IF 1");
          await prisma.contactsWAOnAccountVariableOnBusiness.create({
            data: {
              value: newVar,
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableOnBusinessId,
            },
          });
        } else {
          // console.log("ENTROU IF 2");
          ContactsWAOnAccountVariableOnBusiness.forEach(async (id) => {
            console.log({
              id,
              newVar,
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableOnBusinessId,
            });
            await prisma.contactsWAOnAccountVariableOnBusiness
              .upsert({
                where: id,
                create: {
                  value: newVar,
                  contactsWAOnAccountId: props.contactsWAOnAccountId,
                  variableOnBusinessId,
                },
                update: {
                  value: newVar,
                  contactsWAOnAccountId: props.contactsWAOnAccountId,
                  variableOnBusinessId,
                },
              })
              .catch((err) => console.log("ERROR VARIAVEL", err));
          });
        }
      }
    );

    return res();
  });
