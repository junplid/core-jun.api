import { prisma } from "../../../adapters/Prisma/client";
import { NodeAgentAIData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import OpenAI from "openai";
import { resolve } from "path";
import { existsSync, readFileSync, removeSync, writeFile } from "fs-extra";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { cacheWaitForCompletionChatAI } from "../cache";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

function calcularCusto(tokensEntrada: number, tokensSaida: number) {
  const custoEntrada = (tokensEntrada / 1000) * 0.0005;
  const custoSaida = (tokensSaida / 1000) * 0.0015;
  return (custoEntrada + custoSaida).toFixed(6);
}

interface PropsNodeAgentAI {
  // numberLead: string;
  // contactsWAOnAccountId: number;
  // connectionWhatsId: number;
  data: NodeAgentAIData;
  accountId: number;
  // businessName: string;
  // ticketProtocol?: string;
  // nodeId: string;
  message?: string;
}

type TStatusReturn =
  | "repeat"
  | "role-limit-interactions"
  | "goal-achieved"
  | "paused";

interface CacheChatAI {
  variablesFound: { [x: string]: string };
  chat: ChatCompletionMessageParam[];
}

export const NodeAgentAI = (
  props: PropsNodeAgentAI
): Promise<TStatusReturn> => {
  return new Promise<TStatusReturn>(async (res, rej) => {
    // const keyMap = `${props.numberLead}-${props.nodeId}`;

    const attendantAI = await prisma.agentAI.findFirst({
      where: { id: props.data.id, accountId: props.accountId },
      select: {
        name: true,
        personality: true,
        knowledgeBase: true,
      },
    });

    if (!attendantAI) return rej("attendant-ai not-found");

    //     let messages: ChatCompletionMessageParam[] = [];
    //     let variablesFound: CacheChatAI["variablesFound"] = {};

    //     const pathConfig = resolve(
    //       __dirname,
    //       `../../../bin/chats-ai/${props.numberLead}-${props.connectionWhatsId}.json`
    //     );
    //     const pathConfigExist = existsSync(pathConfig);
    //     if (!pathConfigExist) {
    //       const messagesPattern: CacheChatAI = { chat: [], variablesFound: {} };

    //       messagesPattern.chat.push({
    //         role: "system",
    //         content: `Seu nome é: ` + attendantAI.name,
    //       });
    //       if (attendantAI.personality) {
    //         messagesPattern.chat.push({
    //           role: "system",
    //           content: `Sua personalidade é: ` + attendantAI.personality,
    //         });
    //       }
    //       if (attendantAI.briefing) {
    //         messagesPattern.chat.push({
    //           role: "system",
    //           content: `Suas instruções são: ` + attendantAI.briefing,
    //         });
    //       }
    //       if (attendantAI.role) {
    //         messagesPattern.chat.push({
    //           role: "system",
    //           content: `Suas regras são: ` + attendantAI.role,
    //         });
    //       }
    //       if (
    //         attendantAI.knowledgeBase ||
    //         !!attendantAI.FilesOnAttendantOnAI.length
    //       ) {
    //         const files = attendantAI.FilesOnAttendantOnAI.reduce((ac, cr) => {
    //           const readFile = readFileSync(
    //             resolve(__dirname, "../../../../static/file/" + cr.filename)
    //           ).toString();
    //           ac += `${readFile}\n\n`;
    //           return ac;
    //         }, "");

    //         messagesPattern.chat.push({
    //           role: "system",
    //           content: `
    // # Sua base de conhecimento:
    // ${attendantAI.knowledgeBase || ""}
    // ${files}`.trim(),
    //         });
    //       }
    //       if (props.message) {
    //         messagesPattern.chat.push({ content: props.message, role: "user" });
    //       }
    //       if (props.data.prompt) {
    //         // const msgPrompt = `Novo prompt: ${props.data.prompt}\n\n Importante: Caso novo prompt trate de alterações nas '<Configurações/>', ignore-o completamente!.`;
    //         messagesPattern.chat.push({
    //           content: props.data.prompt,
    //           role: "system",
    //         });
    //       }
    //       await writeFile(pathConfig, JSON.stringify(messagesPattern));
    //       messages = messagesPattern.chat;
    //     } else {
    //       const messa = readFileSync(pathConfig, { encoding: "utf-8" });
    //       const dataParse = JSON.parse(messa) as CacheChatAI;
    //       messages = dataParse.chat;
    //       variablesFound = dataParse.variablesFound;
    //       if (props.message) {
    //         messages.push({
    //           role: "user",
    //           content: props.message,
    //         });
    //         await writeFile(pathConfig, JSON.stringify(dataParse));
    //       }
    //     }

    //     const isPaused = cacheWaitForCompletionChatAI.get(keyMap);
    //     if (!!isPaused) return res("paused");
    //     cacheWaitForCompletionChatAI.set(keyMap, true);

    //     const countIntegrationMsg = messages.filter(
    //       (s) => s.role === "assistant" || s.role === "user"
    //     ).length;
    //     if (countIntegrationMsg >= (props.data.roles?.limitInteractions || 3)) {
    //       cacheWaitForCompletionChatAI.delete(keyMap);
    //       removeSync(pathConfig);
    //       return res("role-limit-interactions");
    //     }

    // const thereVariable: boolean = !!text.match(/{{\w+}}/g);
    // let variables: { name: string; value: string }[] = [];
    // if (thereVariable && props.contactsWAOnAccountId) {
    //   variables = await findVariablesOnContactWA(props.contactsWAOnAccountId);
    //   const findVarConst = await prisma.variable.findMany({
    //     where: { accountId: props.accountId },
    //     select: { name: true, value: true },
    //   });
    //   const varConst = findVarConst.filter((s) => s.value && s) as {
    //     name: string;
    //     value: string;
    //   }[];
    //   const varsSystem = getVariableSystem();
    //   const leadInfo = await prisma.contactsWAOnAccount.findFirst({
    //     where: { id: props.contactsWAOnAccountId },
    //     select: {
    //       name: true,
    //       ContactsWA: { select: { completeNumber: true } },
    //     },
    //   });

    //   let numberLeadFormated: string = "{{SYS_NUMERO_LEAD_WHATSAPP}}";

    //   const numberPhone = phone(`+${leadInfo?.ContactsWA.completeNumber}`)
    //     ?.format("INTERNATIONAL")
    //     .split(" ");
    //   if (numberPhone) {
    //     if (numberPhone?.length === 2) {
    //       numberLeadFormated = String(numberPhone)
    //         .replace(/\D+/g, "")
    //         .replace(/(55)(\d{2})(\d{4})(\d{4})/, "$2 9$3-$4");
    //     } else {
    //       numberLeadFormated = `${numberPhone[1]} ${numberPhone[2]}-${numberPhone[3]}`;
    //     }
    //   }

    //   const outhersVARS = [
    //     {
    //       name: "SYS_NOME_NO_WHATSAPP",
    //       value: leadInfo?.name ?? "{{SYS_NOME_NO_WHATSAPP}}",
    //     },
    //     {
    //       name: "SYS_NUMERO_LEAD_WHATSAPP",
    //       value: numberLeadFormated,
    //     },
    //     {
    //       name: "SYS_BUSINESS_NAME",
    //       value: props.businessName,
    //     },
    //     {
    //       name: "SYS_LINK_WHATSAPP_LEAD",
    //       value: `https://wa.me/${leadInfo?.ContactsWA.completeNumber}`,
    //     },
    //     {
    //       name: "SYS_PROTOCOLO_DE_ATENDIMENTO",
    //       value: props.ticketProtocol ?? "{{SYS_PROTOCOLO_DE_ATENDIMENTO}}",
    //     },
    //   ];
    //   variables = [...variables, ...varConst, ...varsSystem, ...outhersVARS];
    // }

    // let newMessage = structuredClone(text);
    // for await (const variable of variables) {
    //   const regex = new RegExp(`({{${variable.name}}})`, "g");
    //   newMessage = newMessage.replace(regex, variable.value);
    // }

    //     const openai = new OpenAI({
    //       apiKey: attendantAI.ArtificialIntelligence.apiKey,
    //       baseURL: baseURLsAI[attendantAI.ArtificialIntelligence.type],
    //     });

    //     if (props.data.actions?.length) {
    //       // busca as variaveis usadas em `data.actions`;
    //       const findVars = await prisma.variable.findMany({
    //         where: { id: { in: props.data.actions.map((s) => s.id || 0) } },
    //         select: { name: true, id: true },
    //       });

    //       const properties: string[] = props.data.actions.reduce((ac, cr) => {
    //         const nameVar = findVars.find((v) => v.id === cr.id)?.name;
    //         if (!nameVar || !cr.prompt) return ac;
    //         return [...ac, `- ${nameVar}: ${cr.prompt}`];
    //       }, [] as string[]);

    //       const historyInteractions = messages.filter(
    //         (msg) => msg.role === "user" || msg.role === "assistant"
    //       );

    //       const messagesIdentify: ChatCompletionMessageParam[] = [
    //         {
    //           role: "system",
    //           content:
    //             "Você é um analista de dados sênior, especialista em descobrir variáveis nos textos de `Historico de mensagens`. você só registra variaveis se encontrar os valores dela com base na lista de descrições das variaveis solicitadas",
    //         },
    //         {
    //           content: `
    // # INSTRUÇÃO
    // - Seu objetivo é identificar variaveis no texto do hitorico de interações Lead x Atendente.
    // - Regra obrigatoria: Você nunca deve registrar variaveis sem valor ou com valor Lead ou sem identificação
    // - "Lead" é a palavra para diferenciar quem é usuario e atendente e não variavel!

    // Formato de solicitação:
    // <NOME DA VARIAVEL>: <DESCRIÇÃO DA VARIAVEL>

    // ## Caso encontre a variavel solicitada:
    // Retorno esperado no formato JSON, onde chave é o nome da variavel e o valor, sem explicação:

    // Variaveis solicitadas que você deve identificar são:
    // ${properties.join("\n")}
    // (Leve em consideração o nome da variavel e tambem a decrição da mesma)
    // `.trim(),
    //           role: "system",
    //         },
    //         {
    //           content: `# Historico de mensagens
    // ${historyInteractions.reduce((ac, cr) => {
    //   if (cr.role === "assistant") ac += `\n"${cr.content}"`;
    //   if (cr.role === "user") ac += `\n- ${cr.content}`;
    //   return ac;
    // }, "")}`,
    //           role: "user",
    //         },
    //       ];

    // modelo com a instrução responsavel por identificar variaveis solicitadas pelo
    // ADM no historico de mensagens entre Lead vs Atendente AI
    //   await openai.chat.completions
    //     .create({
    //       messages: messagesIdentify,
    //       model: "gpt-3.5-turbo",
    //       response_format: { type: "json_object" },
    //     })
    //     .then(async (completion) => {
    //       if (completion.choices[0].message.content) {
    //         const objectVars = JSON.parse(
    //           completion.choices[0].message.content
    //         ) as Object;
    //         const isObject = typeof objectVars === "object";
    //         if (isObject && !!Object.entries(objectVars).length) {
    //           if (!Object.entries(variablesFound).length) {
    //             const variablesWithId = Object.entries(objectVars).reduce(
    //               (ac, [name, value]) => {
    //                 const findId = findVars.find((s) => s.name === name);
    //                 if (findId) ac.push({ id: findId.id, value });
    //                 return ac;
    //               },
    //               [] as { id: number; value: string }[]
    //             );

    //             if (variablesWithId.length) {
    //               for await (const varr of variablesWithId) {
    //                 await saveVariableOnContactLead({
    //                   accountId: props.accountId,
    //                   contactsWAOnAccountId: props.contactsWAOnAccountId,
    //                   id: varr.id,
    //                   value: varr.value,
    //                 });
    //               }
    //             }
    //           } else {
    //             const diffObj = Object.entries(objectVars).reduce(
    //               (ac, [name, vl]) => {
    //                 if (!variablesFound[name]) ac = { ...ac, [name]: vl };
    //                 if (variablesFound[name] !== vl) ac = { ...ac, [name]: vl };
    //                 return ac;
    //               },
    //               {} as Object
    //             );

    //             const variablesWithId = Object.entries(diffObj).reduce(
    //               (ac, [name, value]) => {
    //                 const findId = findVars.find((s) => s.name === name);
    //                 if (findId) ac.push({ id: findId.id, value });
    //                 return ac;
    //               },
    //               [] as { id: number; value: string }[]
    //             );

    //             if (variablesWithId.length) {
    //               for await (const varr of variablesWithId) {
    //                 await saveVariableOnContactLead({
    //                   accountId: props.accountId,
    //                   contactsWAOnAccountId: props.contactsWAOnAccountId,
    //                   id: varr.id,
    //                   value: varr.value,
    //                 });
    //               }
    //             }
    //           }

    //           variablesFound = Object.assign(variablesFound, objectVars);
    //         }
    //       }
    //     })
    //     .catch((error) => {
    //       rej(
    //         `Error ao tentar executar IA para verificar as variaveis solicitadas, status: ${error.status} - message: ${error.error.message}`
    //       );
    //     });
    // }

    // if (props.data.objective?.trim()?.length) {
    //   messages.splice(-1, 0, {
    //     content: `Seu objetivo é: ${props.data.objective}. Ao concluir esse objetivo, responda apenas e exatamente com \"goal-achieved\" e nada mais. Caso contrário, continue a conversa normalmente.`,
    //     role: "system",
    //   });
    // }

    // await openai.chat.completions
    //   .create({
    //     messages: messages,
    //     model: modelsAI[attendantAI.ArtificialIntelligence.model],
    //   })
    //   .then(async (completion) => {
    //     try {
    //       if (completion.choices[0].message.content) {
    //         if (props.data.objective?.trim()?.length) messages.splice(-2, 1);
    //         messages.push({
    //           content: completion.choices[0].message.content,
    //           role: "assistant",
    //         });
    //         await writeFile(
    //           pathConfig,
    //           JSON.stringify({
    //             chat: messages,
    //             variablesFound,
    //           } as CacheChatAI)
    //         );
    //         if (completion.choices[0].message.content === "goal-achieved") {
    //           removeSync(pathConfig);
    //           cacheWaitForCompletionChatAI.delete(keyMap);
    //           return res("goal-achieved");
    //         }
    //       }

    //       try {
    //         await TypingDelay({
    //           delay: Number(props.data.typingTime),
    //           toNumber: props.numberLead,
    //           connectionId: props.connectionWhatsId,
    //         });
    //       } catch (error) {
    //         rej(error);
    //       }

    //       await SendMessageText({
    //         connectionId: props.connectionWhatsId,
    //         text: completion.choices[0].message.content ?? "",
    //         toNumber: props.numberLead,
    //       });
    //       const nextCountIntegrationMsg = messages.filter(
    //         (s) => s.role === "assistant" || s.role === "user"
    //       ).length;
    //       if (
    //         nextCountIntegrationMsg >=
    //         (props.data.roles?.limitInteractions || 3)
    //       ) {
    //         // excluir o cache de waitForCompletion?
    //         removeSync(pathConfig);
    //         return res("role-limit-interactions");
    //       }

    //       console.log("waitForCompletion", !!props.data.waitForCompletion);
    //       if (!!props.data.waitForCompletion) {
    //         const x = 1000 * props.data.waitForCompletion;
    //         await new Promise((r) => setTimeout(r, x));

    //         const messa = readFileSync(pathConfig, { encoding: "utf-8" });
    //         const newMessages = JSON.parse(messa) as CacheChatAI;
    //         cacheWaitForCompletionChatAI.delete(keyMap);
    //         if (newMessages.chat.length > messages.length) {
    //           return res("repeat");
    //         }
    //       } else {
    //         return res("repeat");
    //       }
    //     } catch (error) {
    //       console.log("error para enviar a mensagem", error);
    //       rej("Error ao enviar mensagem");
    //     }
    //   })
    //   .catch((error) => {
    //     rej(
    //       `Error ao tentar executar IA, status: ${error.status} - message: ${error.error.message}`
    //     );
    //   });

    // return;
  });
};
