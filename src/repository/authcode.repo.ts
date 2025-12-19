import { prisma } from "../config";
import { AuthCode } from "../types/authcode";

class AuthCodeRepository {
    async createAuthCode(data: AuthCode){
        await prisma.authorizationCodes.create({
            data
        })
    }

    async getAuthCodeByCode(code: string){
        return await prisma.authorizationCodes.findFirst({
            where: {
                code
            }
        })
    }

    async useAuthCode(code: string){
        await prisma.authorizationCodes.updateMany({
            where: {
                code,
                used: false
            },
            data: {
                used: true
            }
        })
    }
}

export default AuthCodeRepository;