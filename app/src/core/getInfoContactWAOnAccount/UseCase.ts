import { GetContactWAOnAccountRepository_I } from "./Repository";
import { GetContactWAOnAccountDTO_I } from "./DTO";
import { sessionsBaileysWA } from "../../adapters/Baileys";

export class GetContactWAOnAccountUseCase {
  constructor(private repository: GetContactWAOnAccountRepository_I) {}

  async run(dto: GetContactWAOnAccountDTO_I) {
    const contacts = await this.repository.fetchContactWAOnAccount(dto);

    // const connectionId = await this.repository.fetchConnectionRoot();
    // const sessionWA = sessionsBaileysWA.get(connectionId[0]);

    return {
      message: "OK!",
      status: 200,
      contacts,
    };
  }
}
