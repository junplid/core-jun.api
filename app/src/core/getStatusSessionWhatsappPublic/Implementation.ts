import { Prisma, PrismaClient } from "@prisma/client";
import { GetStatusSessionWhatsappPublicRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetStatusSessionWhatsappPublicImplementation
  implements GetStatusSessionWhatsappPublicRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}
}
