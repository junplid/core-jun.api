import { webSocketEmitToRoom } from "../../infra/websocket";
import { CreateDeltaDTO_I } from "./DTO";
import moment from "moment-timezone";

const tz = "America/Sao_Paulo";

export class CreateDeltaUseCase {
  constructor() {}

  async run({ accountId, delta }: CreateDeltaDTO_I) {
    const date = moment().tz(tz);
    const minutes = date.minutes();
    const roundedMinutes = Math.floor(minutes / 5) * 5;
    const hour = date
      .clone()
      .minutes(roundedMinutes)
      .seconds(0)
      .milliseconds(0)
      .format("HH:mm");

    webSocketEmitToRoom().account(accountId).dashboard.dashboard_services({
      delta,
      hour,
    });
    return { status: 201 };
  }
}
