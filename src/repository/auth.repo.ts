import { prisma } from "../config";
import { RegisterUser, UpdateUser } from "../types/user";

class AuthRepository {
  async createUser(data: RegisterUser) {
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
      },
    });
    return user;
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findFirst({
      where: { email },
    });
  }

  async getUserByMobile(phone: string) {
    return await prisma.user.findFirst({
      where: { phone },
    });
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, data: UpdateUser) {
    return await prisma.user.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
}

export default AuthRepository;
