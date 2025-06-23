import { ErrorResponse } from "../../utils/ErrorResponse";
import { TestFbPixelDTO_I } from "./DTO";
import {
  EventRequest,
  ServerEvent,
  UserData,
} from "facebook-nodejs-business-sdk";
import crypto from "crypto";

export class TestFbPixelUseCase {
  constructor() {}

  async run({ test_event_code, ...dto }: TestFbPixelDTO_I) {
    const hash = (v: string) =>
      crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
    const userData = new UserData()
      .setEmails([hash("[email protected]")])
      .setClientUserAgent("PixelTest/1.0");

    const serverEvent = new ServerEvent()
      .setEventName("TestPixel")
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventId(`test-${Date.now()}`)
      .setActionSource("website")
      .setEventSourceUrl("https://example.com/pixel-test")
      .setUserData(userData);

    try {
      const response = await new EventRequest(dto.access_token, dto.pixel_id) // ordem: token, pixelId :contentReference[oaicite:1]{index=1}
        .setEvents([serverEvent])
        .setTestEventCode(test_event_code) // fundamental para Test Events :contentReference[oaicite:2]{index=2}
        .execute();

      if (response && response.events_received) {
        return { message: "OK!", status: 200 };
      }
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).input({
        path: "pixel_id",
        text: "Pixel invalido ou falta de permissão.",
      });
    }
  }
}
