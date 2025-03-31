import { GetFastMessageHumanServiceAutoCompleteDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { getVariableSystem } from "../../libs/VariablesSystem";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetFastMessageHumanServiceAutoCompleteUseCase {
  constructor() {}

  async run(dto: GetFastMessageHumanServiceAutoCompleteDTO_I) {
    const attendant = await prisma.sectorsAttendants.findFirst({
      where: { id: dto.userId, Sectors: { status: true } },
      select: { accountId: true },
    });

    if (!attendant) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!!`,
        type: "error",
      });
    }

    let variables: { name: string; value: string }[] = [];
    const variablesContact =
      await prisma.contactsWAOnAccountVariableOnBusiness.findMany({
        where: {
          ContactsWAOnAccount: { Tickets: { some: { id: dto.ticketId } } },
        },
        select: {
          value: true,
          VariableOnBusiness: {
            select: { Variable: { select: { name: true } } },
          },
        },
      });

    variables = variablesContact.map((v) => ({
      name: v.VariableOnBusiness.Variable.name,
      value: v.value,
    }));

    const findOtherVar = await prisma.variable.findMany({
      where: {
        accountId: attendant.accountId,
        type: { in: ["system", "constant"] },
      },
      select: { name: true, value: true },
    });

    variables.push(
      ...findOtherVar.map((s) => ({ name: s.name, value: s.value! })),
      ...getVariableSystem()
    );

    const leadInfo = await prisma.contactsWAOnAccount.findFirst({
      where: { Tickets: { some: { id: dto.ticketId } } },
      select: {
        name: true,
        ContactsWA: { select: { completeNumber: true } },
        Tickets: {
          select: { Business: { select: { name: true } }, protocol: true },
        },
      },
    });

    const outhersVARS = [
      {
        name: "SYS_NOME_NO_WHATSAPP",
        value: leadInfo?.name ?? "{{SYS_NOME_NO_WHATSAPP}}",
      },
      {
        name: "SYS_NUMERO_LEAD_WHATSAPP",
        value:
          leadInfo?.ContactsWA.completeNumber ?? "{{SYS_NUMERO_LEAD_WHATSAPP}}",
      },
      {
        name: "SYS_BUSINESS_NAME",
        value: leadInfo?.Tickets[0].Business.name ?? "{{SYS_BUSINESS_NAME}}",
      },
      {
        name: "SYS_LINK_WHATSAPP_LEAD",
        value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
      },
      {
        name: "SYS_PROTOCOLO_DE_ATENDIMENTO",
        value:
          leadInfo?.Tickets[0].protocol ?? "{{SYS_PROTOCOLO_DE_ATENDIMENTO}}",
      },
    ];

    const x = await prisma.fastMessage.findFirst({
      where: { attendantId: dto.userId, id: dto.id },
      select: { value: true },
    });

    if (!x) {
      throw new ErrorResponse(400).toast({
        title: `Mensagem rápida não foi encontrada!`,
        type: "error",
      });
    }

    let newMessage = structuredClone(x.value);
    for await (const variable of variables) {
      const regex = new RegExp(`({{${variable.name}}})`, "g");
      newMessage = newMessage.replace(regex, variable.value);
    }

    return { message: "OK!", status: 200, fastMessages: { value: newMessage } };
  }
}
