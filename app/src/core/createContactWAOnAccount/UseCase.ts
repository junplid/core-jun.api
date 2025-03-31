import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateContactWAOnAccountDTO_I } from "./DTO";
import { CreateContactWAOnAccountRepository_I } from "./Repository";

export class CreateContactWAOnAccountUseCase {
  constructor(private repository: CreateContactWAOnAccountRepository_I) {}

  async run({
    tags,
    variables,
    accountId,
    businessId,
    number,
    isCheck,
    ...dataContact
  }: CreateContactWAOnAccountDTO_I) {
    let numberWhatsAppValid: null | string = null;

    if (isCheck) {
      const connections = await prisma.connectionOnBusiness.findMany({
        where: { Business: { accountId }, number: { not: null } },
        select: { id: true },
      });

      const connectionsValid = connections.map((c) => {
        const botWA = sessionsBaileysWA.get(c.id);
        const status = botWA?.ev.emit("connection.update", {
          connection: "open",
        });

        if (status) return botWA;
      });

      const connectionON = connectionsValid.find((s) => !!s);

      if (!connectionON) {
        throw new ErrorResponse(400).input({
          path: "isCheck",
          text: "Tenha pelo menos uma conexão Ativa para fazer as verificações",
        });
      }

      const isExistOnWhatsApp = await connectionON.onWhatsApp(
        dataContact.completeNumber + "@s.whatsapp.net"
      );
      if (isExistOnWhatsApp?.length && isExistOnWhatsApp[0]?.exists) {
        numberWhatsAppValid = isExistOnWhatsApp[0].jid.replace(
          "@s.whatsapp.net",
          ""
        );
      } else {
        return {
          message: "OK!",
          status: 200,
          contactsWAOnAccountId: null,
        };
      }
    } else {
      numberWhatsAppValid = dataContact.completeNumber;
    }

    if (!numberWhatsAppValid) {
      throw new ErrorResponse(400).toast({
        title: "Número de whatsapp inválido" + " " + numberWhatsAppValid,
      });
    }

    const isExistContactWA = await this.repository.fetchExistingContactsWA({
      completeNumber: numberWhatsAppValid,
    });

    let contactsWAOnAccountId: null | number = null;

    if (isExistContactWA) {
      const contactAccountExist = await prisma.contactsWAOnAccount.findFirst({
        where: { accountId, contactWAId: isExistContactWA.contactsWAId },
        select: { id: true },
      });
      if (!contactAccountExist) {
        contactsWAOnAccountId = (
          await this.repository.connectContactsWAExistingToNewContactsOnAccount(
            {
              accountId,
              contactWAId: isExistContactWA.contactsWAId,
              name: dataContact.name,
            }
          )
        ).contactsWAOnAccountId;
      } else {
        contactsWAOnAccountId = contactAccountExist.id;
      }
    } else {
      contactsWAOnAccountId = (
        await this.repository.createContactsWAAndContactsOnAccount({
          accountId,
          completeNumber: numberWhatsAppValid,
          name: dataContact.name,
        })
      ).contactsWAOnAccountId;
    }

    tags?.forEach(async (name) => {
      const fetchExistingTag = await this.repository.fetchExistingTagOnBusiness(
        { name, accountId, businessIds: businessId }
      );
      if (fetchExistingTag) {
        await this.repository.connectTagOnBusinessToContactsWAOnAccount({
          contactsWAOnAccountId: contactsWAOnAccountId as number,
          tagOnBusinessId: fetchExistingTag.tagOnBusinessId,
        });
      } else {
        const { tagOnBusinessIds } = await this.repository.createTagOnBusiness({
          businessIds: businessId,
          name,
          accountId,
        });
        tagOnBusinessIds.forEach(async (tagOnBusinessId) => {
          await this.repository.createTagOnBusinessOnContactWAOnAccount({
            contactsWAOnAccountId: contactsWAOnAccountId as number,
            tagOnBusinessId,
          });
        });
      }
    });

    let variablesState: [string, string][] | null = null;
    if (variables) variablesState = Object.entries(variables);

    if (variablesState) {
      await Promise.all(
        variablesState.map(async (variable) => {
          const [name, value] = variable;
          const fetchExistingVariable =
            await this.repository.fetchExistingVariablesOnBusiness({
              name,
              accountId,
            });
          if (fetchExistingVariable) {
            await this.repository.connectVariableOnBusinessToContactsWAOnAccount(
              {
                value,
                contactsWAOnAccountId: contactsWAOnAccountId as number,
                variableOnBusinessId: fetchExistingVariable.variableId,
              }
            );
          } else {
            const { variableOnBusinessIds } =
              await this.repository.createVariableOnBusiness({
                name,
                businessIds: businessId,
                accountId,
              });
            variableOnBusinessIds.forEach((variableOnBusinessId) => {
              this.repository.createContactsWAOnAccountVariablesOnBusiness({
                variableOnBusinessId,
                contactsWAOnAccountId: contactsWAOnAccountId as number,
                value,
              });
            });
          }
        })
      );
    }

    return {
      message: "OK!",
      status: 201,
      contactsWAOnAccountId,
    };
  }
}
