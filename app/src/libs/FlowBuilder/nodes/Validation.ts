// se caso todas as variaveis estiverem errada então jogue o fluxo no caminho vermelho

import { isCNPJ, isCPF } from "validation-br";
import { prisma } from "../../../adapters/Prisma/client";
import { getBrazilianCities } from "../../../services/IBGE";
import { NodeValidationData } from "../Payload";
import { getVariableSystem } from "../../VariablesSystem";
import phone from "libphonenumber-js";

interface PropsNodeReply {
  data: NodeValidationData;
  contactsWAOnAccountId: number;
  accountId: number;
  nodeId: string;
  businessName?: string;
  ticketProtocol?: string;
}

function isRegEx(input: string, flags?: string[]) {
  try {
    new RegExp(`/${input}/`, flags?.length ? String(flags) : undefined);
    return true;
  } catch (e) {
    return false;
  }
}

const estadosBrasileiros = [
  "Acre",
  "AC",
  "Alagoas",
  "AL",
  "Amapá",
  "AP",
  "Amazonas",
  "AM",
  "Bahia",
  "BA",
  "Ceará",
  "CE",
  "Distrito Federal",
  "DF",
  "Espírito Santo",
  "ES",
  "Goiás",
  "GO",
  "Maranhão",
  "MA",
  "Mato Grosso",
  "MT",
  "Mato Grosso do Sul",
  "MS",
  "Minas Gerais",
  "MG",
  "Pará",
  "PA",
  "Paraíba",
  "PB",
  "Paraná",
  "PR",
  "Pernambuco",
  "PE",
  "Piauí",
  "PI",
  "Rio de Janeiro",
  "RJ",
  "Rio Grande do Norte",
  "RN",
  "Rio Grande do Sul",
  "RS",
  "Rondônia",
  "RO",
  "Roraima",
  "RR",
  "Santa Catarina",
  "SC",
  "São Paulo",
  "SP",
  "Sergipe",
  "SE",
  "Tocantins",
  "TO",
];

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

type ResultPromise = "fail" | "sucess";

export const NodeValidation = (props: PropsNodeReply): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    let sucessReply: boolean = true;
    const { data } = props;

    const businessIdsOnVariables = await prisma.variableOnBusiness.findMany({
      where: {
        variableId: data.variableId,
        Business: { accountId: props.accountId },
        Variable: { type: "dynamics" },
      },
      select: {
        ContactsWAOnAccountVariableOnBusiness: { select: { value: true } },
      },
    });

    if (data.type === "text") {
      sucessReply = true;
    }

    // let preVariables = [];

    let thereVariable = false;
    let nextValue = structuredClone(props.data.value);

    if (data.type === "value" && props.data.value) {
      thereVariable = !!props.data.value?.match(/{{\w+}}/g);
      let variables: { name: string; value: string | undefined }[] = [];
      if (thereVariable && props.contactsWAOnAccountId) {
        variables = await findVariablesOnContactWA(props.contactsWAOnAccountId);
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
      for await (const variable of variables) {
        const regex = new RegExp(`({{${variable.name}}})`, "g");
        if (variable.value) {
          nextValue = nextValue?.replace(regex, variable.value);
        }
      }
    }

    if (data.type !== "text") {
      const isValid = await Promise.all(
        businessIdsOnVariables.map(async (businessVaribles) => {
          const businessVariblesContact =
            businessVaribles.ContactsWAOnAccountVariableOnBusiness;
          if (!businessVariblesContact.length) return false;

          if (data.type === "value" && data.value !== undefined) {
            return businessVariblesContact.some(
              (bvc) => data.value === bvc.value || nextValue === bvc.value
            );
          }
          if (data.type === "regex" && data.customValidate !== undefined) {
            const isregex = isRegEx(data.customValidate, data.flags);
            if (isregex) {
              const regex = new RegExp(
                data.customValidate,
                data.flags?.length ? String(data.flags) : undefined
              );
              return businessVariblesContact.some((bvc) =>
                regex.test(bvc.value)
              );
            }
          }
          if (data.type === "email") {
            console.log({ businessVariblesContact });
            return businessVariblesContact.some((bvc) =>
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(
                bvc.value.trim()
              )
            );
          }
          if (data.type === "cpf") {
            return businessVariblesContact.some((bvc) =>
              isCPF(bvc.value.trim())
            );
          }
          if (data.type === "cnpj") {
            return businessVariblesContact.some((bvc) =>
              isCNPJ(bvc.value.trim())
            );
          }
          if (data.type === "tel") {
            return businessVariblesContact.some((bvc) => {
              const isIDD = bvc.value.trim().includes("+");
              return !!phone(
                `${isIDD ? "" : "+55"}${bvc.value.trim()}`
              )?.format("INTERNATIONAL");
            });
          }
          if (data.type === "number") {
            return businessVariblesContact.some((bvc) => {
              return /^(\d*)$/i.test(bvc.value.trim());
            });
          }
          if (data.type === "weekday") {
            return businessVariblesContact.some((bvc) => {
              return /^(segunda|terça|quarta|quinta|sexta|sábado|domingo|seg|ter|qua|qui|sex|sab|dom)(-feira| feira)?$/i.test(
                bvc.value.trim()
              );
            });
          }
          if (data.type === "state") {
            return businessVariblesContact.some((bvc) => {
              const regex = new RegExp(
                `^(${estadosBrasileiros.join("|")})$`,
                "i"
              );
              return regex.test(bvc.value.trim());
            });
          }
          if (data.type === "city") {
            const cities = await getBrazilianCities();
            const citiesRegex = new RegExp(`^(${cities.join("|")})$`, "i");
            return businessVariblesContact.some((bvc) => {
              return citiesRegex.test(bvc.value.trim());
            });
          }
          if (data.type === "cep") {
            return businessVariblesContact.some((bvc) => {
              return /^[0-9]{5}-?[0-9]{3}$/.test(bvc.value.trim());
            });
          }
        })
      );

      sucessReply = isValid.some((s) => !!s);
    }

    return res(sucessReply ? "sucess" : "fail");
  });
