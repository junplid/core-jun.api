import { getVariableSystem } from "../../libs/VariablesSystem";
import { GetVariablesContactAccountDTO_I } from "./DTO";
import { GetVariablesContactAccountRepository_I } from "./Repository";

export class GetVariablesContactAccountUseCase {
  constructor(private repository: GetVariablesContactAccountRepository_I) {}

  async run({ userId, ...dto }: GetVariablesContactAccountDTO_I) {
    const variables = await this.repository.fetch(dto);
    const outhersVARS = [
      {
        id: 9987161,
        name: "SYS_NOME_NO_WHATSAPP",
        value: "Nome do contato whatsapp",
      },
      // {
      //   id: 92796122,
      //   name: "SYS_NUMERO_LEAD_WHATSAPP",
      //   value: "Número do contato whatsapp",
      // },
      // {
      //   id: 13,
      //   name: "SYS_BUSINESS_NAME",
      //   value: "Nome do négocio",
      // },
      // {
      //   id: 14,
      //   name: "SYS_LINK_WHATSAPP_LEAD",
      //   value: "https://wa.me/<numero_do_lead>",
      // },
    ];

    return {
      message: "OK!",
      status: 200,
      variables: [...outhersVARS, ...variables],
    };
  }
}
