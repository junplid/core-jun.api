const { PrismaClient } = require("@prisma/client");
const { genSalt, hash } = require("bcrypt");
const prisma = new PrismaClient();

const systemVariables = [
  {
    name: "JUN_NOME_LEAD_WHATSAPP",
    value: "Nome do contato whatsapp",
  },
  {
    name: "JUN_NUMERO_LEAD_WHATSAPP",
    value: "Número do contato whatsapp",
  },
  {
    name: "JUN_LINK_LEAD_WHATSAPP",
    value: "https://wa.me/<Número_Do_Lead>",
  },
  {
    name: "JUN_LINK_START_CHAT_WHATSAPP",
    value:
      'Exemplo de uso: {{LINK_START_CHAT_WHATSAPP}}5599999999999 > Resultado é: "https://wa.me/5599999999999"',
  },
  // {
  //   name: "JUNPROJECT_NAME",
  //   value: "Nome do projeto",
  // },
  {
    name: "JUN_SAUDACAO",
    value: "Bom dia/Boa tarde/Boa noite",
  },
  {
    name: "JUN_DATA_ATUAL",
    value: "Data no formato: DD/MM/YYYY",
  },
  {
    name: "JUN_DIA_ATUAL",
    value: "Data no formato: DD",
  },
  {
    name: "JUN_MES_ATUAL",
    value: "Data no formato: MM",
  },
  {
    name: "JUN_ANO_ATUAL",
    value: "Data no formato: YYYY",
  },
  {
    name: "JUN_NOME_MES_ATUAL",
    value: "Nome do mês atual",
  },
  {
    name: "JUN_DIA_DA_SEMANA",
    value: "Segunda-feira, Terç...",
  },
];

async function main() {
  await prisma.rootUsers.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      email: "root@email.com",
      password: await hash("aBc09812@.0", await genSalt(8)),
    },
    update: {},
  });
  for (const variable of systemVariables) {
    const exists = await prisma.variable.findFirst({
      where: { name: variable.name },
      select: { id: true },
    });

    if (!exists) {
      await prisma.variable.create({
        data: { ...variable, type: "system" },
      });
    }
  }
  // const plan = await prisma.plan.upsert({
  //   where: { id: 1 },
  //   create: {
  //     description: "Gerado por padrão na primeira inicialização do servidor",
  //     name: "Plano padrão",
  //     allowsRenewal: true,
  //     acceptsNewUsers: true,
  //     activeFoSubscribers: true,
  //     type: "free",
  //     isDefault: true,
  //     PlanAssets: {
  //       create: {
  //         attendants: 3,
  //         business: 3,
  //         chatbots: 3,
  //         connections: 3,
  //         contactsWA: 3,
  //         flow: 3,
  //         marketingSends: 3,
  //         nodeAction: true,
  //         nodeCheckPoint: true,
  //         nodeDistributeFlow: true,
  //         nodeEmailSending: true,
  //         nodeInitial: true,
  //         nodeInsertLeaderInAudience: true,
  //         nodeInterruption: true,
  //         nodeInterruptionLinkTackingPixel: true,
  //         nodeLinkTackingPixel: true,
  //         nodeLogicalConditionData: true,
  //         nodeMathematicalOperators: true,
  //         nodeMenu: true,
  //         nodeMessage: true,
  //         nodeNewCardTrello: true,
  //         nodeNotifyNumber: true,
  //         nodeReply: true,
  //         nodeSendAudio: true,
  //         nodeSendContactData: true,
  //         nodeSendFile: true,
  //         nodeSendHumanService: true,
  //         nodeSendImage: true,
  //         nodeSendLink: true,
  //         nodeSendLocationGPS: true,
  //         nodeSendPdf: true,
  //         nodeSendVideo: true,
  //         nodeSwitch: true,
  //         nodeTime: true,
  //         nodeWebform: true,
  //         nodeWebhook: true,
  //         users: 3,
  //       },
  //     },
  //   },
  //   update: {},
  //   select: { id: true },
  // });
}

main()
  .then(async () => {
    console.log("Seed completed");
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log("Seed failed: ", err);
    await prisma.$disconnect();
  });
