import { prisma } from "../../adapters/Prisma/client";
import { updateCustomerAssas } from "../../services/Assas/Customer";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateCustomerDTO_I } from "./DTO";

export class UpdateCustomerUseCase {
  constructor() {}

  async run({ accountId, ...dto }: UpdateCustomerDTO_I) {
    try {
      const existCustomer = await prisma.account.findFirst({
        where: { id: accountId },
        select: { customerId: true },
      });

      if (!existCustomer?.customerId) {
        throw new ErrorResponse(400).toast({
          title: `Dados cadastrais de cliente não encontrado`,
          type: "error",
        });
      }
      await updateCustomerAssas(existCustomer.customerId, dto);

      if (dto.name) {
        await prisma.account.update({
          where: { id: accountId },
          data: { name: dto.name },
        });
      }

      return {
        message: "Dados cadastrais atualizado com sucesso!",
        status: 200,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar dados cadastrais`,
        type: "error",
      });
    }
  }
}
