import { prisma } from "../../adapters/Prisma/client";
import { createCustomerAssas } from "../../services/Assas/Customer";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCustomerAsaasDTO_I } from "./DTO";

export class CreateCustomerAsaasUseCase {
  constructor() {}

  async run(dto: CreateCustomerAsaasDTO_I) {
    const account = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: { email: true },
    });

    if (!account?.email) {
      throw new ErrorResponse(401).toast({
        title: "Não autorizado",
        type: "error",
      });
    }
    const costumer = await createCustomerAssas({
      cpfCnpj: dto.cpfCnpj,
      name: dto.name,
    });

    await prisma.account.update({
      where: { id: dto.accountId },
      data: { customerId: costumer.customerAssasId, name: dto.name },
    });

    return { message: "OK!", status: 201 };
  }
}
