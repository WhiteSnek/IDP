import { prisma } from "../config";
import { RegisterApplication } from "../types/application";

class ApplicationRepository{
    async registerApplication(data: RegisterApplication){
        return await prisma.applications.create({
            data,
            select: {
                id: true
            }
        })
    }

    async getApplicationByClientId(clientId: string){
        return await prisma.applications.findFirst({
            where: {
                clientId
            }
        })
    }
}

export default ApplicationRepository;