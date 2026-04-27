import { NodeGetMenuOnlineData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { connectedDevices } from "../../../infra/websocket/cache";
import moment from "moment-timezone";
import { localVariables } from "../utils/LocalVariables";

type PropsGetMenuOnline =
  | {
      contactsWAOnAccountId: number;
      data: NodeGetMenuOnlineData;
      accountId: number;
      mode: "prod";
      keyControl: string;
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
      keyControl: string;
    };

export const NodeGetMenuOnline = async (
  props: PropsGetMenuOnline,
): Promise<"not_found" | "ok"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou buscar cardapio digital, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return "ok";
  }

  try {
    const { fields, ...restData } = props.data;

    if (!fields?.length) return "ok";

    const getmenu = await prisma.menusOnline.findFirst({
      where: { accountId: props.accountId },
      select: {
        MenuInfo: {
          select: {
            address: true,
            city: true,
            delivery_fee: true,
            lat: true,
            lng: true,
            phone_contact: true,
            state_uf: true,
            whatsapp_contact: true,
            deliveries_begin_at: true,
          },
        },
        desc: true,
        deviceId_app_agent: true,
        identifier: true,
        titlePage: true,
        is_accepting_motoboys: true,
      },
    });

    if (!getmenu) return "not_found";

    if (fields.includes("address") && restData.varId_save_address) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_address, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.address || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.address || "",
            },
          });
        }
      }
    }

    if (fields.includes("address") && restData.save_locale_var_name_address) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_address,
        getmenu.MenuInfo?.address || "",
      ]);
    }

    if (fields.includes("city") && restData.varId_save_city) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_city, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.city || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.city || "",
            },
          });
        }
      }
    }

    if (fields.includes("city") && restData.save_locale_var_name_city) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_city,
        getmenu.MenuInfo?.city || "",
      ]);
    }

    if (fields.includes("delivery_fee") && restData.varId_save_delivery_fee) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_delivery_fee, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.delivery_fee?.toNumber().toFixed() || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.delivery_fee?.toNumber().toFixed() || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("delivery_fee") &&
      restData.save_locale_var_name_delivery_fee
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_delivery_fee,
        getmenu.MenuInfo?.delivery_fee?.toNumber().toFixed() || "",
      ]);
    }

    if (fields.includes("desc") && restData.varId_save_desc) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_desc, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.desc || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.desc || "",
            },
          });
        }
      }
    }

    if (fields.includes("desc") && restData.save_locale_var_name_desc) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_desc,
        getmenu.desc || "",
      ]);
    }

    if (
      fields.includes("is_accepting_motoboys") &&
      restData.varId_save_is_accepting_motoboys
    ) {
      const exist = await prisma.variable.findFirst({
        where: {
          id: restData.varId_save_is_accepting_motoboys,
          type: "dynamics",
        },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.is_accepting_motoboys ? "Sim" : "Não",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.is_accepting_motoboys ? "Sim" : "Não",
            },
          });
        }
      }
    }

    if (
      fields.includes("is_accepting_motoboys") &&
      restData.save_locale_var_name_is_accepting_motoboys
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_is_accepting_motoboys,
        getmenu.is_accepting_motoboys ? "Sim" : "Não",
      ]);
    }

    if (
      fields.includes("deviceId_app_agent") &&
      restData.varId_save_deviceId_app_agent
    ) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_deviceId_app_agent, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.deviceId_app_agent || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.deviceId_app_agent || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("deviceId_app_agent") &&
      restData.save_locale_var_name_deviceId_app_agent
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_deviceId_app_agent,
        getmenu.deviceId_app_agent || "",
      ]);
    }

    if (fields.includes("device_online") && restData.varId_save_device_online) {
      let status_device = false;
      if (getmenu.deviceId_app_agent) {
        const socket = connectedDevices.get(getmenu.deviceId_app_agent);
        status_device = !!socket;
      }

      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_device_online, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: status_device ? "ON" : "OFF",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: status_device ? "ON" : "OFF",
            },
          });
        }
      }
    }

    if (
      fields.includes("device_online") &&
      restData.save_locale_var_name_device_online
    ) {
      let status_device = false;
      if (getmenu.deviceId_app_agent) {
        const socket = connectedDevices.get(getmenu.deviceId_app_agent);
        status_device = !!socket;
      }

      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_device_online,
        status_device ? "ON" : "OFF",
      ]);
    }

    if (fields.includes("identifier") && restData.varId_save_identifier) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_identifier, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.identifier || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.identifier || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("identifier") &&
      restData.save_locale_var_name_identifier
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_identifier,
        getmenu.identifier || "",
      ]);
    }

    if (fields.includes("lat") && restData.varId_save_lat) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_lat, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.lat?.toString() || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.lat?.toString() || "",
            },
          });
        }
      }
    }

    if (fields.includes("lat") && restData.save_locale_var_name_lat) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_lat,
        getmenu.MenuInfo?.lat?.toString() || "",
      ]);
    }

    if (fields.includes("lng") && restData.varId_save_lng) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_lng, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.lng?.toString() || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.lng?.toString() || "",
            },
          });
        }
      }
    }

    if (fields.includes("lng") && restData.save_locale_var_name_lng) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_lng,
        getmenu.MenuInfo?.lng?.toString() || "",
      ]);
    }

    if (fields.includes("link") && restData.varId_save_link) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_link, type: "dynamics" },
        select: { id: true },
      });

      let link = "";
      if (process.env.NODE_ENV === "prod") {
        link = `https://menu.junplid.com.br/${getmenu.identifier}`;
      } else {
        link = `http://localhost:4001/${getmenu.identifier}`;
      }

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: link,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: link,
            },
          });
        }
      }
    }

    if (fields.includes("link") && restData.save_locale_var_name_link) {
      let link = "";
      if (process.env.NODE_ENV === "prod") {
        link = `https://menu.junplid.com.br/${getmenu.identifier}`;
      } else {
        link = `http://localhost:4001/${getmenu.identifier}`;
      }
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_link,
        link,
      ]);
    }

    if (fields.includes("phone_contact") && restData.varId_save_phone_contact) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_phone_contact, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.phone_contact || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.phone_contact || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("phone_contact") &&
      restData.save_locale_var_name_phone_contact
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_phone_contact,
        getmenu.MenuInfo?.phone_contact || "",
      ]);
    }

    if (fields.includes("state_uf") && restData.varId_save_state_uf) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_state_uf, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.state_uf || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.state_uf || "",
            },
          });
        }
      }
    }

    if (fields.includes("state_uf") && restData.save_locale_var_name_state_uf) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_state_uf,
        getmenu.MenuInfo?.state_uf || "",
      ]);
    }

    if (fields.includes("titlePage") && restData.varId_save_titlePage) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_titlePage, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.titlePage || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.titlePage || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("titlePage") &&
      restData.save_locale_var_name_titlePage
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_titlePage,
        getmenu.titlePage || "",
      ]);
    }

    if (
      fields.includes("whatsapp_contact") &&
      restData.varId_save_whatsapp_contact
    ) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_whatsapp_contact, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.whatsapp_contact || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.whatsapp_contact || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("whatsapp_contact") &&
      restData.save_locale_var_name_whatsapp_contact
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_whatsapp_contact,
        getmenu.MenuInfo?.whatsapp_contact || "",
      ]);
    }

    if (
      fields.includes("deliveries_begin_at") &&
      restData.varId_save_deliveries_begin_at
    ) {
      const exist = await prisma.variable.findFirst({
        where: {
          id: restData.varId_save_deliveries_begin_at,
          type: "dynamics",
        },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.deliveries_begin_at || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getmenu.MenuInfo?.deliveries_begin_at || "",
            },
          });
        }
      }
    }

    if (
      fields.includes("deliveries_begin_at") &&
      restData.save_locale_var_name_deliveries_begin_at
    ) {
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_deliveries_begin_at,
        getmenu.MenuInfo?.deliveries_begin_at || "",
      ]);
    }

    if (
      fields.includes("have_deliveries_started") &&
      restData.varId_save_have_deliveries_started
    ) {
      const exist = await prisma.variable.findFirst({
        where: {
          id: restData.varId_save_have_deliveries_started,
          type: "dynamics",
        },
        select: { id: true },
      });

      let state: "Sim" | "Não" = "Sim";
      const horario = getmenu.MenuInfo?.deliveries_begin_at;
      if (horario) {
        const agora = moment.tz("America/Sao_Paulo");

        const [hora, minuto] = horario.split(":").map(Number);

        const inicio = moment
          .tz("America/Sao_Paulo")
          .hour(hora)
          .minute(minuto)
          .second(0)
          .millisecond(0);

        if (agora.isBefore(inicio)) {
          state = "Não";
        } else {
          state = "Sim";
        }
      }

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: state,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: state,
            },
          });
        }
      }
    }

    if (
      fields.includes("have_deliveries_started") &&
      restData.save_locale_var_name_have_deliveries_started
    ) {
      let state: "Sim" | "Não" = "Sim";
      const horario = getmenu.MenuInfo?.deliveries_begin_at;
      if (horario) {
        const agora = moment.tz("America/Sao_Paulo");

        const [hora, minuto] = horario.split(":").map(Number);

        const inicio = moment
          .tz("America/Sao_Paulo")
          .hour(hora)
          .minute(minuto)
          .second(0)
          .millisecond(0);

        if (agora.isBefore(inicio)) {
          state = "Não";
        } else {
          state = "Sim";
        }
      }
      localVariables.upsert(props.keyControl, [
        restData.save_locale_var_name_have_deliveries_started,
        state,
      ]);
    }

    return "ok";
  } catch (error) {
    return "not_found";
  }
};
