import { GetMenuOnlinePublicDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import moment from "moment";
import { MenuOnlineOperatingDays } from "@prisma/client";

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

  return `abre ${nextOpening.locale("pt-br").format("dddd").replace("-feira", "")} às ${nextOpening.format("HH:mm")}`;
}

const WEEK_DAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function normalizeOperatingDays(
  OperatingDays: Omit<MenuOnlineOperatingDays, "id" | "menuId">[],
) {
  const map: any = {};

  // agrupa horários por dia
  for (const s of OperatingDays) {
    const time = `${s.startHourAt} às ${s.endHourAt}`;

    if (!map[s.dayOfWeek]) {
      map[s.dayOfWeek] = [];
    }

    map[s.dayOfWeek].push(time);
  }

  // cria chave de horário
  const groups: any = {};

  for (const [day, times] of Object.entries(map)) {
    // @ts-expect-error
    const timeKey = times.sort().join(" • ");

    if (!groups[timeKey]) {
      groups[timeKey] = [];
    }

    groups[timeKey].push(Number(day));
  }

  // formata ranges de dias
  function formatDays(days: any) {
    days.sort((a: any, b: any) => a - b);

    if (days.length === 1) {
      return WEEK_DAYS[days[0]];
    }

    if (days.length === 2) {
      return `${WEEK_DAYS[days[0]]} e ${WEEK_DAYS[days[1]]}`;
    }

    return `${WEEK_DAYS[days[0]]} a ${WEEK_DAYS[days[days.length - 1]]}`;
  }

  return Object.entries(groups).map(([time, days]) => ({
    day: formatDays(days),
    time,
  }));
}

export class GetMenuOnlinePublicUseCase {
  constructor() {}

  async run(dto: GetMenuOnlinePublicDTO_I) {
    const momento = moment.tz("America/Sao_Paulo");
    const dayweek = momento.weekday();
    // const now = momento.clone().utc().toDate();

    const data = await prisma.menusOnline.findFirst({
      where: { identifier: dto.identifier },
      select: {
        uuid: true,
        bg_primary: true,
        bg_secondary: true,
        bg_tertiary: true,
        logoImg: true,
        bg_capa: true,
        titlePage: true,
        status: true,
        Categories: {
          orderBy: { sequence: "asc" },
          where: {
            Items: { some: {} },
            OR: [
              { days_in_the_week: { isEmpty: true } },
              { days_in_the_week: { has: dayweek } },
              // { days_in_the_week: null },
              // {
              //   AND: [
              //     // startAt deve ser nulo (sem limite inferior) OU <= now
              //     {
              //       OR: [
              //         { startAt: { equals: null } },
              //         { startAt: { lte: now } },
              //       ],
              //     },
              //     // endAt deve ser nulo (sem limite superior) OU >= now
              //     {
              //       OR: [{ endAt: { equals: null } }, { endAt: { gte: now } }],
              //     },
              //   ],
              // },
            ],
          },
          select: {
            name: true,
            uuid: true,
            image45x45png: true,
            id: true,
          },
        },
        Items: {
          orderBy: {
            date_validity: {
              sort: "asc",
              nulls: "last",
            },
          },
          where: {
            Categories: { some: {} },
            OR: [
              { date_validity: null },
              { date_validity: { gte: new Date() } },
            ],
          },
          select: {
            name: true,
            desc: true,
            img: true,
            qnt: true,
            uuid: true,
            afterPrice: true,
            beforePrice: true,
            Categories: {
              where: {
                Category: {
                  OR: [
                    { days_in_the_week: { isEmpty: true } },
                    { days_in_the_week: { has: dayweek } },
                    // {
                    //   AND: [
                    //     // startAt deve ser nulo (sem limite inferior) OU <= now
                    //     {
                    //       OR: [
                    //         { startAt: { equals: null } },
                    //         { startAt: { lte: now } },
                    //       ],
                    //     },
                    //     // endAt deve ser nulo (sem limite superior) OU >= now
                    //     {
                    //       OR: [
                    //         { endAt: { equals: null } },
                    //         { endAt: { gte: now } },
                    //       ],
                    //     },
                    //   ],
                    // },
                  ],
                },
              },
              select: { Category: { select: { uuid: true, id: true } } },
            },
            Sections: {
              orderBy: { sequence: "asc" },
              select: {
                helpText: true,
                title: true,
                required: true,
                uuid: true,
                id: true,
                maxOptions: true,
                minOptions: true,
                SubItems: {
                  orderBy: { sequence: "asc" },
                  select: {
                    uuid: true,
                    status: true,
                    desc: true,
                    after_additional_price: true,
                    before_additional_price: true,
                    image55x55png: true,
                    name: true,
                    maxLength: true,
                  },
                },
              },
            },
          },
        },
        MenuInfo: {
          select: {
            address: true,
            city: true,
            links: true,
            phone_contact: true,
            state_uf: true,
            whatsapp_contact: true,
            payment_methods: true,
            delivery_fee: true,
          },
        },
        OperatingDays: {
          select: {
            dayOfWeek: true,
            endHourAt: true,
            startHourAt: true,
          },
        },
        ConnectionWA: { select: { Chatbot: { select: { id: true } } } },
      },
    });

    if (!data) {
      return new ErrorResponse(400).container(
        "Cardápio digital não encontrado",
      );
    }

    const { Categories, Items, status, MenuInfo, OperatingDays, ...r } = data;
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
    }

    return {
      message: "OK!",
      status: 200,
      menu: {
        ...r,
        isChatbot: !!data.ConnectionWA?.Chatbot.length,
        info: { ...MenuInfo, delivery_fee: MenuInfo?.delivery_fee?.toNumber() },
        helperTextOpening,
        operatingDays: OperatingDays.length
          ? normalizeOperatingDays(OperatingDays)
          : [{ day: "Todos os dias", time: "24h" }],
        status: statusMenu,
        items: Items.map(({ Sections, Categories, ...item }) => {
          const valid = !Sections.some((s) => {
            if (s.minOptions) {
              return s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status);
            }
            return false;
          });

          return {
            ...item,
            qnt: valid ? item.qnt : 0,
            categories: Categories.map((c) => c.Category),
            afterPrice: item.afterPrice?.toNumber(),
            beforePrice: item.beforePrice?.toNumber(),
            sections: Sections.map(({ SubItems, ...s }) => ({
              ...s,
              subItems: SubItems.map(
                ({
                  after_additional_price,
                  before_additional_price,
                  ...b
                }) => ({
                  ...b,
                  after_additional_price: after_additional_price?.toNumber(),
                  before_additional_price: before_additional_price?.toNumber(),
                }),
              ),
            })),
          };
        }),
        categories: Categories,
      },
    };
  }
}
