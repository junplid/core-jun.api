import { prisma } from "../../adapters/Prisma/client";
import { CreateTemplateDTO_I } from "./DTO";
import vm from "node:vm";
import { transformSync } from "esbuild";
import Joi from "joi";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { ulid } from "ulid";

export interface ICacheCreateTemplate {
  nodeId: string;
  previous_response_id?: string;
  agent: any;
  flow: { nodes: any; edges: any };
  flowId: string;
  accountId: number;
}

function mapInputType(type: Input["type"], isMult?: boolean) {
  switch (type) {
    case "text":
    case "textarea":
      return Joi.string();
    case "number":
      return Joi.number();
    case "select":
      if (isMult) {
        return Joi.array().items(Joi.string());
      }
      return Joi.string();
    case "tags-input":
      return Joi.array().items(Joi.string());
  }
}

interface Input {
  name: string;
  required?: boolean;
  max?: number;
  min?: number;
  isMulti?: boolean;
  type: "text" | "number" | "textarea" | "select" | "tags-input";
}

type DataSocketMapCreate =
  | {
      label: string;
      type: "error" | "success" | "wait" | "runner";
      id: string;
    }
  | {
      type: "error-input";
      input: { path: string; text: string }[];
    };

const sleep = (time: number) => new Promise((s) => setTimeout(s, time * 1000));

export class CreateTemplateUseCase {
  constructor() {}

  async run(dto: CreateTemplateDTO_I) {
    (async () => {
      const socketAccount = webSocketEmitToRoom().account(dto.accountId);
      await new Promise((s) => setTimeout(s, 400));
      socketAccount.emit(
        `modal-template-${dto.modalHash}`,
        {
          id: "1",
          type: "runner",
        } as DataSocketMapCreate,
        [],
      );
      await sleep(2);

      const business = await prisma.business.findFirst({
        where: { accountId: dto.accountId },
        select: { id: true },
      });

      if (!business) {
        socketAccount.emit(
          `modal-template-${dto.modalHash}`,
          {
            input: [
              { path: "root", text: "Workspace da conta não encontrado." },
            ],
            type: "error-input",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      const findTemplate = await prisma.templates.findFirst({
        where: { id: dto.templatedId },
        select: {
          Sections: { select: { name: true, inputs: true } },
          script_runner: true,
        },
      });
      if (!findTemplate) {
        socketAccount.emit(
          `modal-template-${dto.modalHash}`,
          {
            input: [
              {
                path: "root",
                text: "Não foi possivel encontrar o template.",
              },
            ],
            type: "error-input",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }
      const schemaValidation = Joi.object(
        findTemplate.Sections.reduce<Record<string, Joi.ObjectSchema>>(
          (acc, section) => {
            const inputsSchema = section.inputs.reduce<
              Record<string, Joi.Schema>
            >((inputsAcc, input) => {
              // @ts-expect-error
              const inputJson = input as Input;

              let fieldSchema = mapInputType(inputJson.type);

              if (inputJson.min) {
                fieldSchema = fieldSchema.min(inputJson.min);
              }

              if (inputJson.max) {
                fieldSchema = fieldSchema.max(inputJson.max);
              }

              if (inputJson.required) {
                fieldSchema = fieldSchema.required();
              } else {
                fieldSchema = fieldSchema.optional();
              }

              inputsAcc[inputJson.name] = fieldSchema;
              return inputsAcc;
            }, {});

            acc[section.name] = Joi.object(inputsSchema);
            return acc;
          },
          {},
        ),
      );
      const validation = schemaValidation.validate(dto.fields, {
        abortEarly: false,
      });
      if (validation.error) {
        socketAccount.emit(
          `modal-template-${dto.modalHash}`,
          {
            input: validation.error.details.map((element) => ({
              path: `fields.${element.path.join(".")}`,
              text: "Campo obrigatório.",
            })),
            type: "error-input",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      try {
        socketAccount.emit(
          `modal-template-${dto.modalHash}`,
          {
            id: "6",
            type: "runner",
          } as DataSocketMapCreate,
          [],
        );
        await sleep(3);

        const jsCode = transformSync(findTemplate.script_runner, {
          loader: "ts",
        }).code;

        async function createChatbot({
          TimeToRestart,
          ...data
        }: {
          TimeToRestart?: {
            value: number;
            type: "seconds" | "minutes" | "hours" | "days";
          };
          addToLeadTagsIds?: number[];
          fallback?: string;
          trigger?: string;
          destLink?: string;
        }) {
          try {
            // await prisma.chatbot.create({
            //   data: {
            //     accountId: dto.accountId,
            //     connectionWAId: connectionId,
            //     flowId: flowId!,
            //     name: `Chatbot for ${dataDependence!.agent.name} - ${nodeUnique}`,
            //     ...data,
            //     ...(TimeToRestart && {
            //       TimeToRestart: { create: TimeToRestart },
            //     }),
            //     AgentAI: { connect: { id: agentAIId! } },
            //     businessId: business!.id,
            //     status: true,
            //     description: `Criada para o Assistente de IA "${dataDependence!.agent.name} - ${nodeUnique}"`,
            //   },
            //   select: {
            //     createAt: true,
            //   },
            // });
          } catch (error) {
            console.log("NÃO CRIOU O ASSISTENTE");
          }
        }

        const context = {
          console,
          props: {
            sections_inputs: dto.fields,
            accountId: dto.accountId,
            db: { createChatbot },
            // AgentTemplate: {
            //   tagsId: dataDependence.tags?.map((s) => s.id),
            //   variablesId: dataDependence.variables?.map((s) => s.id),
            // },
          } as {
            accountId: number;
            db: {
              createChatbot: (data: any) => Promise<void>;
            };
            sections_inputs: Record<string, Record<string, number | string>>;
            AgentTemplate: {
              variablesId: number[];
              tagsId: number[];
            };
          },
          setTimeout,
        };

        vm.createContext(context);

        const script = new vm.Script(`
   (async () => {
     ${jsCode}
     if (typeof runner === 'function') {
       await runner(props);
     }
   })()
  `);

        await script.runInContext(context, { timeout: 5000 });
        socketAccount.emit(
          `modal-template-${dto.modalHash}`,
          {
            id: "6",
            label: "Chatbot.",
            type: "success",
            // connectionId,
          } as DataSocketMapCreate,
          [],
        );
      } catch (error) {
        socketAccount.emit(
          `modal-template-${dto.modalHash}`,
          {
            id: "6",
            label: "Error ao criar Chatbot de recepção.",
            type: "error",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }
    })();

    return {
      message: "OK.",
      status: 200,
    };
  }
}
