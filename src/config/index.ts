import { PrismaClient } from "../../prisma/generated/client";
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({ adapter })
