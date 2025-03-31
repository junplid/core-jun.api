import { resolve } from "path";
import { sendEmail } from "../../../adapters/NodeMailer";
import { prisma } from "../../../adapters/Prisma/client";
import { getVariableSystem } from "../../VariablesSystem";
import { NodeEmailSendingData } from "../Payload";
import phone from "libphonenumber-js";
import { lookup } from "mime-types";
import { readFileSync } from "fs-extra";

interface PropsNodeEmailSending {
  contactsWAOnAccountId: number;
  data: NodeEmailSendingData;
  accountId: number;
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
          select: { Variable: { select: { name: true } } },
        },
      },
    }
  );
  return variables.map((v) => ({
    name: v.VariableOnBusiness.Variable.name,
    value: v.value,
  }));
};

export const NodeEmailSending = (
  props: PropsNodeEmailSending
): Promise<void> => {
  return new Promise(async (res, rej) => {
    const thereVariable: boolean = [
      !!props.data.text.match(/{{\w+}}/g),
      !!props.data.html.match(/{{\w+}}/g),
    ].some((v) => v);
    let variables: { name: string; value: string }[] = [];
    if (thereVariable) {
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

    let newMessageHtml = structuredClone(props.data.html);
    let newMessageText = structuredClone(props.data.text);
    for await (const variable of variables) {
      const regex = new RegExp(`({{${variable.name}}})`, "g");
      newMessageText = newMessageText.replace(regex, variable.value);
      newMessageHtml = newMessageHtml.replace(regex, variable.value);
    }

    const emailService = await prisma.emailServiceConfiguration.findUnique({
      where: { id: props.data.emailServiceId },
      select: {
        host: true,
        port: true,
        secure: true,
        pass: true,
        user: true,
      },
    });

    if (!emailService) return rej("Email service not found");

    const nameFiles = await prisma.staticPaths.findMany({
      where: { id: { in: props.data.staticFileId } },
      select: { name: true, originalName: true },
    });

    const attachments = nameFiles.map((nameFile) => {
      return {
        filename: nameFile.name,
        content: readFileSync(
          resolve(__dirname, `../../../../static/file/${nameFile.name}`)
        ),
      };
    });

    try {
      await sendEmail({
        send: {
          from: `"${props.data.remetent.name}" <${props.data.remetent.email}>`,
          to: props.data.recipients.map((e) => e.email).join(", "),
          subject: props.data.subject,
          text: newMessageText,
          html: newMessageHtml,
          attachments,
        },
        transporter: {
          auth: {
            pass: emailService.pass,
            user: emailService.user,
          },
          host: emailService.host,
          port: emailService.port,
          secure: emailService.secure ?? false,
        },
      });
      return res();
    } catch (error) {
      return rej("Error on send email");
    }
  });
};
