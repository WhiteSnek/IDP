import { Role } from "../../prisma/generated/enums";
import { prisma } from "../config";
import { RegisterUserApplication } from "../types/application";

class UserApplicationRepository {
    async registerApplication(data: RegisterUserApplication){
        await prisma.userApplications.create({
            data
        })
    }

    async getApplicationById(id: string){
        return await prisma.userApplications.findUnique({
            where: {
                id
            }
        })
    }

    async getAllApplications(){
        return await prisma.userApplications.findMany({
            select:{
                userId: true,
                applicationId: true,
                createdAt: true,
                role: true,
                user: {
                    select: {
                        email: true,
                        first_name: true,
                        last_name: true
                    }
                },
                application: {
                    select: {
                        name: true,
                        clientId: true
                    }
                }
            }
        })
    }

    async getApplicationByUserAndApplicationId(userId: string, applicationId: string){
        return await prisma.userApplications.findFirst({
            where: {
                userId,
                applicationId
            }
        })
    }

    async getUserApplications(userId: string){
        return await prisma.userApplications.findMany({
            where: {
                userId
            },
            select: {
                userId: true,
                applicationId: true,
                role: true,
                application: {
                    select: {
                        name: true,
                        createdAt: true
                    }
                }
            }
        })
    }

    async getApplicationUsers(applicationId: string){
        await prisma.userApplications.findMany({
            where: {
                applicationId
            },
            select: {
                userId: true,
                applicationId: true,
                user: {
                    select: {
                        email: true,
                        first_name: true,
                        last_name: true,
                        createdAt: true,
                        phone_no: true,
                        ISD_code: true
                    }
                }
            }
        })
    }

    async makeAdmin(userId: string, applicationId: string){
        await prisma.userApplications.updateMany({
            where: {
                userId,
                applicationId
            }, 
            data: {
                role: Role.ADMIN
            }
        })
    }
}

export default UserApplicationRepository;