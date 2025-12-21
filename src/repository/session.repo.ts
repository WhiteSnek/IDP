import { prisma } from "../config";
import { SessionType } from "../types/session";

class SessionRepository{
    async registerSession(data: SessionType){
        await prisma.sessions.create({
            data
        })
    }

    async getUserSessions(userId: string){
        return await prisma.sessions.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                userId: true,
                userAgent: true,
                ipAddress: true,
                createdAt: true,
                expiresAt: true
            }
        })
    }

    async getSessionByToken(refreshToken: string){
        return await prisma.sessions.findFirst({
            where: {
                refreshToken
            }
        })
    }

    async deleteSession(refreshToken: string){
        return await prisma.sessions.delete({
            where: {
                refreshToken
            }
        })
    }

    async deleteSessionById(id: string){
        await prisma.sessions.delete({
            where: {
                id
            }
        })
    }

    async getSessionById(id: string){
        return await prisma.sessions.findUnique({
            where: {
                id
            }
        })
    }
}

export default SessionRepository;