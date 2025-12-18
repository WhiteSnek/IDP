import AuthRepository from "../repository/auth.repo";
import { RegisterUser } from "../types/user";
import { ApiResponse } from "../utils/ApiResponse";
import { hash, compare } from "bcrypt"
import generateToken from "../utils/generateToken";

class AuthService {
    private repository: AuthRepository;
    constructor(){
        this.repository = new AuthRepository();
    }

    async registerUser(data: RegisterUser){
        try{
            let existingUser = await this.repository.getUserByEmail(data.email);
            if(existingUser){
                return new ApiResponse(409, {}, "User with this email already exists");
            }
            existingUser = await this.repository.getUserByMobile(data.phone_no, data.ISD_code);
            if(existingUser){
                return new ApiResponse(409, {}, "User with this mobile number already exists");
            }
            data.password = await hash(data.password, 10);
            const user = await this.repository.createUser(data);
            return new ApiResponse(201, user, "User registered successfully");
        } catch (error) {
            console.log(error)
            return new ApiResponse(500, {}, "Internal Server Error");
        }
    }

    async loginUser(email: string | "",phone_no: string | "", ISD_code: string | "", password: string){
        try{
            const user = await this.repository.getUserByEmail(email) || await this.repository.getUserByMobile(phone_no, ISD_code);
            if(!user){
                return {response: new ApiResponse(401, {}, "Invalid credentials"),};
            }
            const checkPassword = await compare(password, user.password);
            if(!checkPassword){
                return {response: new ApiResponse(401, {}, "Invalid credentials"),};
            }
            const accessToken = generateToken({id: user.id}, "access");
            const refreshToken = generateToken({id: user.id}, "refresh");
            return {response: new ApiResponse(200, { id: user.id, email: user.email }, "Login successful"), accessToken, refreshToken};
        } catch (error) {
            console.log(error);
            return {response: new ApiResponse(500, error, "Internal Server Error"), accessToken: null, refreshToken: null};
        }
    }

    async getUserProfile(userId: string){
        try {
            const user = await this.repository.getUserById(userId);
            if(!user){
                return new ApiResponse(404, {}, "User not found"); 
            }
            const data = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_no: user.phone_no,
                ISD_code: user.ISD_code
            };
            return new ApiResponse(200, data, "User profile fetched successfully");
        } catch (error) {
            return new ApiResponse(500, error, "Internal Server Error");
        }
    }
    // TODO: Add updateUserProfile service method
    // TODO: Add deleteUser service method
    // TODO: Add validate email service method
    // TODO: Add validate phone number service method
    // TODO: Add change password service method

}

export default AuthService;