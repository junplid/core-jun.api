import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateMenuOnlineStatusDTO_I } from "./DTO";

export class UpdateMenuOnlineStatusUseCase {
  constructor() {}

  async run(dto: UpdateMenuOnlineStatusDTO_I) {
    try {
      const menu = await prisma.menusOnline.findFirst({
        where: { accountId: dto.accountId, uuid: dto.uuid },
        select: {
          id: true,
          titlePage: true,
          status: true,
          logoImg: true,
          MenuInfo: {
            select: {
              address: true,
              city: true,
              state_uf: true,
              payment_methods: true,
              whatsapp_contact: true,
            },
          },
        },
      });

      if (!menu) {
        throw new ErrorResponse(400).input({
          text: "Cardápio não encontrado.",
          path: "root",
        });
      }

      if (menu.status === dto.status) {
      }

      if (dto.status) {
        const categories = await prisma.menuOnlineCategory.findFirst({
          where: { Items: { some: {} } },
          select: { id: true },
        });

        const errorResponse = new ErrorResponse(400);

        if (!menu.titlePage) {
          errorResponse.input({
            path: "title",
            text: "- Falta: Título da página.",
          });
        }
        if (!menu.logoImg) {
          errorResponse.input({ path: "logo", text: "- Falta: Logo imagem." });
        }
        if (!menu.MenuInfo?.city) {
          errorResponse.input({ path: "city", text: "- Falta: Cidade." });
        }
        if (!menu.MenuInfo?.state_uf) {
          errorResponse.input({
            path: "state",
            text: "- Falta: UF de estado.",
          });
        }
        if (!menu.MenuInfo?.address) {
          errorResponse.input({
            path: "address",
            text: "- Falta: Endereço completo.",
          });
        }
        if (!menu.MenuInfo?.payment_methods.length) {
          errorResponse.input({
            path: "methods",
            text: "- Falta: Método de pagamento.",
          });
        }
        if (!categories?.id) {
          errorResponse.input({
            path: "categories",
            text: "- Falta: Categoria com pelo menos um produto.",
          });
        }
        if (errorResponse.getResponse().input.length) throw errorResponse;
      }

      await prisma.menusOnline.update({
        where: { id: menu.id },
        data: { status: dto.status },
      });

      return { message: "OK.", status: 201 };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new ErrorResponse(400).input({
        text: "Error ao tentar atualizar status do Menu.",
        path: "root",
      });
    }
  }
}
