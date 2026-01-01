import { prisma } from "../config";
import { RegisterUser } from "../types/user";

class AuthRepository{
    async createUser(data: RegisterUser){
        const user = await prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true
            }
        })
        return user;
    }

    async getUserByEmail(email: string){
        return await prisma.user.findFirst({
            where: { email }
        })
    }

    async getUserByMobile(phone: string){
        return await prisma.user.findFirst({
            where: { phone }
        })
    }
    
    async getUserById(id: string){
        return await prisma.user.findUnique({
            where: { id }
    })}
}

export default AuthRepository;