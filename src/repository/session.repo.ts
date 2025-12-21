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
}

export default SessionRepository;