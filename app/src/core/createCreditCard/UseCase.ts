import { getCustomerAssas } from "../../services/Assas/Customer";
import { CreateCreditCardDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { AsaasCreateCreditCardToken } from "../../services/Assas/Payments";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateCreditCardUseCase {
  constructor() {}

  async run(dto: CreateCreditCardDTO_I) {
    const customer = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: { customerId: true },
    });

    if (!customer?.customerId) {
      throw new ErrorResponse(400).toast({
        title:
          "Para cadastrar cartão ou fazer qualquer transação, precisamos dos dados `CPF` e `Nome completo`",

        type: "error",
      });
    }

    let isCustomer = false;

    try {
      isCustomer = !!(await getCustomerAssas(customer.customerId));
    } catch (error) {
      await prisma.account.update({
        where: { id: dto.accountId },
        data: { customerId: null },
      });
      throw new ErrorResponse(400).toast({
        title:
          "Para cadastrar cartão ou fazer qualquer transação, precisamos dos dados `CPF` e `Nome completo`",

        type: "error",
      });
    }

    if (!isCustomer) {
      await prisma.account.update({
        where: { id: dto.accountId },
        data: { customerId: null },
      });
      throw new ErrorResponse(400).toast({
        title:
          "Para cadastrar cartão ou fazer qualquer transação, precisamos dos dados `CPF` e `Nome completo`",

        type: "error",
      });
    }

    let creditCardToken: any = null;

    try {
      creditCardToken = await AsaasCreateCreditCardToken({
        remoteIp: dto.remoteIp,
        customer: customer.customerId,
        creditCard: dto.creditCard,
        creditCardHolderInfo: dto.creditCardHolderInfo,
      });
    } catch (errors) {
      throw new ErrorResponse(400)
        .toast({ title: "Não foi possivel gerar token de segurança do cartão" })
        .container("Não foi possivel gerar token de segurança do cartão");
    }

    const { id, createAt } = await prisma.creditCardsOnAccount.create({
      data: {
        token: creditCardToken.creditCardToken,
        band: creditCardToken.creditCardBrand,
        name: dto.creditCard.holderName.toUpperCase(),
        accountId: dto.accountId,
        numberCard: creditCardToken.creditCardNumber,
      },
      select: { id: true, createAt: true },
    });

    return {
      message: "OK!",
      status: 201,
      creditCard: {
        id,
        createAt,
        band: creditCardToken.creditCardBrand,
        numberCard: creditCardToken.creditCardNumber,
      },
    };
  }
}
