import { WASocket } from "baileys";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { CreateInsertLeadOnDemandAudienceDTO_I } from "./DTO";
import { CreateInsertLeadOnDemandAudienceRepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateInsertLeadOnDemandAudienceUseCase {
  constructor(
    private repository: CreateInsertLeadOnDemandAudienceRepository_I
  ) {}

  async run({ accountId, id, ...dto }: CreateInsertLeadOnDemandAudienceDTO_I) {
    // const accountInfo = await prisma.accountSubscriptions.findFirst({
    //   where: { Account: { id: accountId, Plan: { type: "paid" } } },
    //   orderBy: { id: "desc" },
    //   select: {
    //     Payment: {
    //       take: 1,
    //       orderBy: { id: "desc" },
    //       select: { status: true },
    //     },
    //   },
    // });

    // if (accountInfo) {
    //   const validStatusPayment = Joi.string()
    //     .valid(
    //       "RECEIVED",
    //       "CONFIRMED",
    //       "RECEIVED_IN_CASH",
    //       "PAYMENT_ANTICIPATED"
    //     )
    //     .optional()
    //     .validate(accountInfo.Payment[0].status);

    //   if (validStatusPayment.error) {
    //     console.log("Os recursos foram interrompidos", {
    //       accountId: accountId,
    //     });
    //     return;
    //   }
    // }

    const dataCampaign = await prisma.campaign.findFirst({
      where: { id, accountId, isOndemand: true },
      select: {
        Account: { select: { assetsUsedId: true } },
        CampaignOnBusiness: {
          select: {
            businessId: true,
            ConnectionOnCampaign: {
              select: {
                ConnectionOnBusiness: { select: { id: true, number: true } },
              },
            },
          },
        },
        AudienceOnCampaign: { take: 1, select: { audienceId: true } },
      },
    });

    if (!dataCampaign) {
      throw new ErrorResponse(400).input({
        path: "id",
        text: "Webform não encontrado",
      });
    }

    const businessIds = dataCampaign.CampaignOnBusiness.map(
      (s) => s.businessId
    );
    const audienceId = dataCampaign.AudienceOnCampaign[0].audienceId;
    const connectionIds = dataCampaign.CampaignOnBusiness.map((s) =>
      s.ConnectionOnCampaign.map((d) => d.ConnectionOnBusiness)
    ).flat();

    const isExistContactWA = await this.repository.fetchExistingContactsWA({
      completeNumber: dto.number,
    });

    let contactWAOnAccountId: null | number = null;

    if (isExistContactWA) {
      contactWAOnAccountId = (
        await this.repository.connectContactsWAExistingToNewContactsOnAccount({
          accountId,
          contactWAId: isExistContactWA.contactsWAId,
          name: dto.name,
        })
      ).contactsWAOnAccountId;
    } else {
      contactWAOnAccountId = (
        await this.repository.createContactsWAAndContactsOnAccount({
          accountId,
          name: dto.name,
          completeNumber: dto.number,
        })
      ).contactsWAOnAccountId;
    }

    dto.tags?.forEach(async (name) => {
      const fetchExistingTag = await this.repository.fetchExistingTagOnBusiness(
        { name, accountId, businessIds }
      );
      if (fetchExistingTag) {
        await this.repository.connectTagOnBusinessToContactsWAOnAccount({
          contactsWAOnAccountId: contactWAOnAccountId as number,
          tagOnBusinessId: fetchExistingTag.tagOnBusinessId,
        });
      } else {
        const { tagOnBusinessIds } = await this.repository.createTagOnBusiness({
          businessIds,
          name,
          accountId,
        });
        tagOnBusinessIds.forEach(async (tagOnBusinessId) => {
          await this.repository.createTagOnBusinessOnContactWAOnAccount({
            contactsWAOnAccountId: contactWAOnAccountId as number,
            tagOnBusinessId,
          });
        });
      }
    });

    let variablesState: [string, string][] | null = null;
    if (dto.variables) variablesState = Object.entries(dto.variables);

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
                contactsWAOnAccountId: contactWAOnAccountId as number,
                variableOnBusinessId: fetchExistingVariable.variableId,
              }
            );
          } else {
            const { variableOnBusinessIds } =
              await this.repository.createVariableOnBusiness({
                name,
                businessIds,
                accountId,
              });
            variableOnBusinessIds.forEach((variableOnBusinessId) => {
              this.repository.createContactsWAOnAccountVariablesOnBusiness({
                variableOnBusinessId,
                contactsWAOnAccountId: contactWAOnAccountId as number,
                value,
              });
            });
          }
        })
      );
    }

    // uma função anonima pq não quero esperar o bloco
    // executa e já retorna a response sem esperar terminar a execução
    (async () => {
      const randTime = Math.floor(Math.random() * (180000 - 360000)) + 360000;
      await new Promise((res: any) => setTimeout(() => res(), randTime));

      const findFlow = await this.repository.findFlowId({
        accountId: accountId,
        campaignId: id,
      });

      if (findFlow) {
        const flow = await this.repository.fetchFlow({
          _id: findFlow.flowId,
          accountId,
        });

        if (flow) {
          const { flowStateId } = await this.repository.create({
            audienceId,
            contactWAOnAccountId,
            campaignId: id,
          });

          const concat = // @ts-expect-error
            ([] as [{ id: number; number: string | null }]).concat(
              ...connectionIds
            );

          const connectionsValids = concat
            .map(({ id, number }) => {
              try {
                const isConnected = sessionsBaileysWA
                  .get(id)
                  ?.ev.emit("connection.update", { connection: "open" });
                return isConnected
                  ? {
                      id: id,
                      bot: sessionsBaileysWA.get(id),
                      numberConnection: number,
                    }
                  : null;
              } catch (error) {
                return null;
              }
            })
            .filter((s) => s) as {
            id: number;
            bot: WASocket;
            numberConnection: string;
          }[];

          console.log({ connectionsValids });

          const info = await prisma.connectionOnBusiness.findFirst({
            where: { id: connectionsValids[0].id },
            select: { Business: { select: { name: true } } },
          });

          await prisma.connectionOnBusiness.update({
            where: { id: connectionsValids[0].id },
            data: { countShots: { increment: 1 } },
          });

          await prisma.accountAssetsUsed.update({
            where: { id: dataCampaign.Account.assetsUsedId },
            data: { marketingSends: { increment: 1 } },
          });

          await NodeControler({
            businessName: info?.Business.name!,
            connectionWhatsId: connectionsValids[0].id,
            clientWA: connectionsValids[0].bot,
            lead: { number: dto.number + "@s.whatsapp.net" },
            accountId: accountId,
            flowId: findFlow.flowId,
            numberConnection:
              connectionsValids[0].numberConnection! + "@s.whatsapp.net",
            type: "initial",
            campaignId: id,
            contactsWAOnAccountId: contactWAOnAccountId as number,
            flowStateId: flowStateId,
            nodes: flow.nodes,
            edges: flow.edges,
            currentNodeId: "0",
            onEnterNode: async () => console.log("Entrou no node"),
            onErrorNumber: () => console.log("Numero deu error"),
            onExecutedNode: async ({ id, type }, isShots) => {
              await prisma.flowState
                .update({
                  where: { id: flowStateId },
                  data: {
                    indexNode: id,
                    ...(isShots && { isSent: isShots }),
                  },
                })
                .catch((err) => console.log(err));
            },
            onFinish: async () => {
              console.log("finalizou");
              await prisma.flowState.update({
                where: { id: flowStateId },
                data: { isFinish: true },
              });
            },
          });

          await prisma.connectionOnBusiness.update({
            where: { id: connectionsValids[0].id },
            data: { countShots: { increment: 1 } },
          });
        }
      }
    })();

    return { message: "OK", status: 201 };
  }
}
