import { GetCustomerDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { getCustomerAssas } from "../../services/Assas/Customer";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCustomerUseCase {
  constructor() {}

  async run(dto: GetCustomerDTO_I) {
    const findCustomerLocal = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: {
        customerId: true,
        name: true,
      },
    });

    if (!findCustomerLocal?.customerId) {
      return { status: 200, userCostumer: false };
    }

    try {
      const customerAsaas = await getCustomerAssas(
        findCustomerLocal.customerId
      );
      if (!customerAsaas) {
        return { status: 200, userCostumer: false };
      }

      return {
        message: "Dados do cliente encontrados com sucesso",
        status: 200,
        userCostumer: {
          name: findCustomerLocal.name,
          cpfCnpj: customerAsaas.cpfCnpj,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Ocorreu um error no servidor!`,
        type: "error",
      });
    }
  }
}
