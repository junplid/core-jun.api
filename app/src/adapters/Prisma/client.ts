import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getPrisma = () => prisma;

export { prisma, getPrisma };
