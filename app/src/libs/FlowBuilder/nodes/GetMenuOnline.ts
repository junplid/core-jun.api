import { NodeGetMenuOnlineData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { connectedDevices } from "../../../infra/websocket/cache";

type PropsGetMenuOnline =
  | {
      contactsWAOnAccountId: number;
      data: NodeGetMenuOnlineData;
      accountId: number;
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
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
          },
        },
        desc: true,
        deviceId_app_agent: true,
        identifier: true,
        titlePage: true,
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
    return "ok";
  } catch (error) {
    return "not_found";
  }
};
