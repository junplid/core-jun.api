import { GetMenuOnlineDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import moment from "moment";
import { MenuOnlineOperatingDays } from "@prisma/client";
import { connectedDevices } from "../../infra/websocket/cache";

function findNextOpening(
  OperatingDays: Omit<MenuOnlineOperatingDays, "id" | "menuId">[],
) {
  const now = moment.tz("America/Sao_Paulo");
  const today = now.day();

  const openings = OperatingDays.map((s) => {
    const [hour, minute] = s.startHourAt.split(":").map(Number);

    const diffDays = (s.dayOfWeek - today + 7) % 7;

    const openMoment = moment
      .tz("America/Sao_Paulo")
      .add(diffDays, "days")
      .set({
        hour,
        minute,
        second: 0,
        millisecond: 0,
      });

    // se hoje e já passou, joga para semana que vem
    if (diffDays === 0 && openMoment.isBefore(now)) {
      openMoment.add(7, "days");
    }

    return openMoment;
  });

  openings.sort((a, b) => a.valueOf() - b.valueOf());

  return openings[0];
}

function getOpeningText(nextOpening: moment.Moment) {
  const now = moment.tz("America/Sao_Paulo");

  const diffMinutes = nextOpening.diff(now, "minutes");
  const diffHours = nextOpening.diff(now, "hours");
  const diffDays = nextOpening
    .clone()
    .startOf("day")
    .diff(now.clone().startOf("day"), "days");

  if (diffMinutes <= 1) {
    return "abre agora";
  }

  if (diffMinutes < 60) {
    return `abre em ${diffMinutes}min`;
  }

  if (diffHours <= 3) {
    return `abre em ${diffHours}h`;
  }

  if (diffDays === 0) {
    return `abre às ${nextOpening.format("HH:mm")}`;
  }

  if (diffDays === 1) {
    return `abre amanhã às ${nextOpening.format("HH:mm")}`;
  }

  return `abre ${nextOpening.format("dddd")} às ${nextOpening.format("HH:mm")}`;
}

export class GetMenuOnlineUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineDTO_I) {
    const momento = moment.tz("America/Sao_Paulo");
    const dayweek = momento.weekday();

    const menu = await prisma.menusOnline.findFirst({
      where: dto,
      select: {
        id: true,
        identifier: true,
        uuid: true,
        desc: true,
        bg_primary: true,
        bg_secondary: true,
        bg_tertiary: true,
        logoImg: true,
        status: true,
        titlePage: true,
        bg_capa: true,
        connectionWAId: true,
        deviceId_app_agent: true,
        MenuInfo: {
          select: {
            address: true,
            city: true,
            delivery_fee: true,
            payment_methods: true,
            phone_contact: true,
            state_uf: true,
            whatsapp_contact: true,
            lat: true,
            lng: true,
          },
        },
        OperatingDays: {
          select: {
            dayOfWeek: true,
            endHourAt: true,
            startHourAt: true,
          },
        },
      },
    });

    if (!menu) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio digital não foi encontrado.`,
        type: "error",
      });
    }
    const { status, OperatingDays, MenuInfo, ...r } = menu;

    let statusMenu = status;
    let helperTextOpening = "";

    const now = momento.format("HH:mm");
    const isOpenNow = OperatingDays.some((s) => {
      const isDay = s.dayOfWeek === dayweek;
      if (!isDay) return false;

      const start = moment.tz(s.startHourAt, "HH:mm", "America/Sao_Paulo");
      const end = moment.tz(s.endHourAt, "HH:mm", "America/Sao_Paulo");

      const current = moment.tz(now, "HH:mm", "America/Sao_Paulo");

      return current.isBetween(start, end, undefined, "[)");
    });

    if (statusMenu) {
      statusMenu = isOpenNow;

      if (!isOpenNow && OperatingDays.length) {
        const nextOpening = findNextOpening(OperatingDays);
        helperTextOpening = getOpeningText(nextOpening);
      }
    } else {
      helperTextOpening = "Desativado.";
    }

    let status_device = false;
    if (menu.deviceId_app_agent) {
      const socket = connectedDevices.get(menu.deviceId_app_agent);
      status_device = !!socket;
    }

    return {
      message: "OK!",
      status: 200,
      menu: {
        status_device,
        statusNow: !!statusMenu,
        statusMenu: status,
        helperTextOpening,
        operatingDays: OperatingDays,
        info: MenuInfo
          ? { ...MenuInfo, delivery_fee: MenuInfo.delivery_fee?.toNumber() }
          : undefined,
        ...r,
      },
    };
  }
}
