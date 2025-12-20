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

    async getAllApplications(){
        return await prisma.applications.findMany({
            select: {
                clientId: true,
                name: true,
                createdAt: true,
                redirectUrls: true
            }
        });
    }

    async deleteApplication(clientId: string){
        await prisma.applications.delete({
            where: {
                clientId
            }
        })
    }
}

export default ApplicationRepository;