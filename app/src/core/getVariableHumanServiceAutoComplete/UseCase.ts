import { GetVariableHumanServiceAutoCompleteDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetVariableHumanServiceAutoCompleteUseCase {
  constructor() {}

  async run(dto: GetVariableHumanServiceAutoCompleteDTO_I) {
    const attendant = await prisma.sectorsAttendants.findFirst({
      where: { id: dto.userId, status: true },
      select: { accountId: true },
    });

    if (!attendant) throw { message: "Não authorizado!", statusCode: 401 };

    const fetchVar =
      await prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
        where: {
          VariableOnBusiness: { variableId: dto.id },
          ContactsWAOnAccount: { Tickets: { some: { id: dto.ticketId } } },
        },
        select: {
          value: true,
          VariableOnBusiness: {
            select: { Variable: { select: { name: true, value: true } } },
          },
        },
      });

    if (!fetchVar) {
      throw { message: "Variavel não encontrada!", statusCode: 400 };
    }

    const value = fetchVar.value ?? fetchVar?.VariableOnBusiness.Variable.value;

    return {
      message: "OK!",
      status: 200,
      variable: {
        value: value ?? `{{${fetchVar.VariableOnBusiness.Variable.name}}}`,
      },
    };
  }
}
