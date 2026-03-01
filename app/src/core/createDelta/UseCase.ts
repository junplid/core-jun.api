import { webSocketEmitToRoom } from "../../infra/websocket";
import { CreateDeltaDTO_I } from "./DTO";
import moment from "moment-timezone";

const tz = "America/Sao_Paulo";

export class CreateDeltaUseCase {
  constructor() {}

  async run({ accountId, delta }: CreateDeltaDTO_I) {
    const hour = moment()
      .tz(tz)
      .startOf("minute")
      .minutes(Math.floor(moment().tz(tz).minutes() / 5) * 5)
      .format("HH:mm");

    webSocketEmitToRoom().account(accountId).dashboard.dashboard_services({
      delta,
      hour,
    });
    return { status: 201 };
  }
}
