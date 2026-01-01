import AuthRepository from "../repository/auth.repo";
import { RegisterUser } from "../types/user";
import { ApiResponse } from "../utils/ApiResponse";
import { hash, compare } from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { prisma } from "../config";

class AuthService {
  private repository: AuthRepository;
  constructor() {
    this.repository = new AuthRepository();
  }

  async registerUser(data: RegisterUser) {
    try {
      let existingUser = await this.repository.getUserByEmail(data.email);
      if (existingUser) {
        return new ApiResponse(409, {}, "User with this email already exists");
      }
      existingUser = await this.repository.getUserByMobile(
        data.phone
      );
      if (existingUser) {
        return new ApiResponse(
          409,
          {},
          "User with this mobile number already exists"
        );
      }
      data.password = await hash(data.password, 10);
      const user = await this.repository.createUser(data);
      return new ApiResponse(201, user, "User registered successfully");
    } catch (error) {
      return new ApiResponse(500, {}, "Internal Server Error");
    }
  }

  async loginUser(
    email: string | "",
    phone: string | "",
    password: string
  ) {
    try {
      const user =
        (await this.repository.getUserByEmail(email)) ||
        (await this.repository.getUserByMobile(phone));
      if (!user) {
        return { response: new ApiResponse(401, {}, "Invalid credentials"), accessToken: null, refreshToken: null };
      }
      const checkPassword = await compare(password, user.password);
      if (!checkPassword) {
        return { response: new ApiResponse(401, {}, "Invalid credentials"), accessToken: null, refreshToken: null };
      }
      const accessToken = generateToken({ id: user.id, isAdmin: user.isAdmin }, "access");
      const refreshToken = generateToken({ id: user.id, isAdmin: user.isAdmin }, "refresh");
      return {
        response: new ApiResponse(
          200,
          { id: user.id, email: user.email },
          "Login successful"
        ),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error)
      return {
        response: new ApiResponse(500, error, "Internal Server Error"),
        accessToken: null,
        refreshToken: null,
      };
    }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.repository.getUserById(userId);
      if (!user) {
        return new ApiResponse(404, {}, "User not found");
      }
      const data = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        isAdmin: user.isAdmin,
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified
      };
      return new ApiResponse(200, data, "User profile fetched successfully");
    } catch (error) {
      return new ApiResponse(500, error, "Internal Server Error");
    }
  }

  async getUserByEmail(email: string){
    return await this.repository.getUserByEmail(email)
  }

  // TODO: Add updateUserProfile service method
  async updateUser(userId: string, data: any){
    await prisma.user.update({
      where: {
        id: userId
      },
      data
    })
  }
  // TODO: Add deleteUser service method
  // TODO: Add validate email service method
  // TODO: Add validate phone number service method
  // TODO: Add change password service method
}

export default AuthService;
