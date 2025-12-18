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
}

export default ApplicationRepository;