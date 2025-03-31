import { resolve } from "path";
import { sendEmail } from "../../adapters/NodeMailer";
import { createTokenAuth } from "../../helpers/authToken";
import { SendPasswordRecoveryEmailDTO_I } from "./DTO";
import { SendPasswordRecoveryEmailRepository_I } from "./Repository";
import { readFile } from "fs-extra";
import { ErrorResponse } from "../../utils/ErrorResponse";

interface RootJSON {
  "token-asaas": string;
  "endpoint-asaas": string;
  host?: string;
  port?: number;
  secure?: boolean;
  authUser?: string;
  authPass?: string;
  email?: string;
}

export class SendPasswordRecoveryEmailUseCase {
  constructor(private repository: SendPasswordRecoveryEmailRepository_I) {}

  async run(dto: SendPasswordRecoveryEmailDTO_I) {
    let user: null | {
      id: number;
      type: "attendant" | "supervisor" | "adm";
      hash: string;
    } = null;

    if (dto.type === "account") {
      const data = await this.repository.findAccount({
        email: dto.email,
      });

      if (data) user = { ...data, type: "adm" };
    }

    if (dto.type === "human-service") {
      user = await this.repository.findHumanService({
        email: dto.email,
      });
    }

    if (!user) {
      throw {
        message: "Dados de acesso incorretos",
        status: 400,
        errors: [{ message: "Conta não encontrada", path: ["email"] }],
      };
    }

    const token = Buffer.from(
      await createTokenAuth(user, "recover-password-whabot")
    ).toString("base64");

    const path = resolve(__dirname, "../../config/root.json");
    const rootJSON: RootJSON = JSON.parse((await readFile(path)).toString());

    const isValidSMTP =
      !!rootJSON.authPass &&
      !!rootJSON.authUser &&
      !!rootJSON.email &&
      !!rootJSON.host &&
      !!rootJSON.port &&
      rootJSON.secure !== undefined;

    try {
      await sendEmail({
        send: {
          html: `Olá, clique no link para recuperar sua senha: http://http://161.97.67.166:82/recover-password/${token}`,
          from: isValidSMTP ? rootJSON.email! : "ggrian.dev@gmail.com",
          to: dto.email,
          subject: "Recuperação de senha",
          text: `Olá, clique no link para recuperar sua senha: http://localhost:5173/recover-password/${token}`,
        },
        transporter: {
          auth: {
            pass: isValidSMTP ? rootJSON.authPass! : "8e5b7cda202a7e",
            user: isValidSMTP ? rootJSON.authUser! : "fc870b1f7d798e",
          },
          host: isValidSMTP ? rootJSON.host! : "sandbox.smtp.mailtrap.io",
          port: isValidSMTP ? Number(rootJSON.port!) : 2525,
          secure: isValidSMTP ? rootJSON.secure! : false,
        },
      });
      return { message: "OK", status: 200, sucess: "OK" };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao enviar email de recuperação de senha`,
        type: "error",
      });
    }
  }
}
