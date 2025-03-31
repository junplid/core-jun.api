import { sequentialDistributeFlow } from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { clientRedis } from "../../../adapters/RedisDB";
import { NodeDistributeFlowData } from "../Payload";

interface PropsNodeDistributeFlow {
  data: NodeDistributeFlowData;
  connectionNumber: string;
  accountId: number;
  nodeId: string;
}

interface BalancedRedis {
  amountLead: number;
  exits: {
    expected: number;
    current: number;
    key: string;
  }[];
}

export const NodeDistributeFlow = (
  props: PropsNodeDistributeFlow
): Promise<string | null> =>
  new Promise(async (res, rej) => {
    const { data, connectionNumber } = props;

    if (data.type === "random") {
      const randIndex = (Math.random() * data.exits.length) >> 0;
      return res(data.exits[randIndex].key);
    }

    if (data.type === "sequential") {
      const currentExit = sequentialDistributeFlow.get(connectionNumber);
      if (!currentExit) {
        sequentialDistributeFlow.set(connectionNumber, data.exits[1].key);
        return res(data.exits[0].key);
      }

      const currentExitIndex = data.exits.findIndex(
        (p) => p.key === currentExit
      );
      const nextExitKey =
        data.exits.length - 1 === currentExitIndex
          ? data.exits[0].key
          : data.exits[currentExitIndex + 1].key;

      sequentialDistributeFlow.set(connectionNumber, nextExitKey);
      return res(currentExit);
    }

    if (data.type === "balanced") {
      const redis = await clientRedis();
      const balancedCache = await redis.get(`balanced-${connectionNumber}`);

      if (!balancedCache) {
        const amountLead = await prisma.contactsWAOnAccountOnAudience.count({
          where: {
            Audience: {
              accountId: props.accountId,
              AudienceOnCampaign: {
                some: {
                  Campaign: {
                    CampaignOnBusiness: {
                      some: {
                        ConnectionOnCampaign: {
                          some: {
                            ConnectionOnBusiness: {
                              number: connectionNumber,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const balanced: BalancedRedis = {
          amountLead,
          exits: data.exits.map((ex, i) => {
            const expected =
              (((ex.percentage as number) / 100) * amountLead) >> 0;

            return {
              key: ex.key,
              expected,
              current: !i ? 1 : 0,
            };
          }),
        };

        await redis.set(
          `balanced-${connectionNumber}`,
          JSON.stringify(balanced)
        );
        return res(data.exits[0].key);
      }

      const balanced: BalancedRedis = JSON.parse(balancedCache);
      const getBalanceIncomplete = balanced.exits.find(
        (e) => e.current < e.expected
      );

      if (!getBalanceIncomplete) return res("FINISH");

      const nextBalanced = balanced.exits.map((ex, i) => {
        if (ex.key === getBalanceIncomplete.key) {
          return {
            ...ex,
            current: ex.current++,
          };
        }
        return ex;
      });

      await redis.set(
        `balanced-${connectionNumber}`,
        JSON.stringify(nextBalanced)
      );
      return res(getBalanceIncomplete.key);
    }

    if (data.type === "intelligent") {
      // usar o bloco de checkpoint para saber qual valor tem e fazer a logica
      // Exemplo: passou 50 leads no bloco de chepoints ? faz isso : faz aquilo
    }

    return res(null);
  });
