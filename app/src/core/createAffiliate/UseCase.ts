import { prisma } from "../../adapters/Prisma/client";
import { createSubAccountAssas } from "../../services/Assas/Account";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateAffiliateDTO_I } from "./DTO";
import { CreateAffiliateRepository_I } from "./Repository";

export class CreateAffiliateUseCase {
  constructor(private repository: CreateAffiliateRepository_I) {}

  async run({ rootId, number: completeNumber, ...dto }: CreateAffiliateDTO_I) {
    const contact = await this.repository.createContactWA({
      completeNumber,
    });

    const {
      address,
      addressNumber,
      cpfCnpj,
      email,
      incomeValue,
      name,
      postalCode,
      birthDate,
      province,
      ...rest
    } = dto;

    try {
      const subaccount = await createSubAccountAssas({
        address,
        addressNumber,
        cpfCnpj,
        mobilePhone: completeNumber,
        email,
        incomeValue,
        name,
        postalCode,
        province,
        birthDate,
      });

      const affiliate = await prisma.affiliates.create({
        data: {
          ...rest,
          status: !!dto.status,
          subAccountId: subaccount.id,
          walletId: subaccount.walletId,
          apiKey: subaccount.apiKey,
          name,
          email,
          contactWAId: contact.contactWAId,
        },
        select: { id: true, createAt: true },
      });

      return { message: "OK!", status: 201, affiliate };
    } catch (error: any) {
      if (typeof error == "number") {
        throw new ErrorResponse(400).toast({
          title: "Autorização negada pelo Asaas",
          type: "error",
        });
      }
      throw new ErrorResponse(400).toast({
        title: "Error inesperado em nossos servidores",
        type: "error",
      });
    }
  }
}
