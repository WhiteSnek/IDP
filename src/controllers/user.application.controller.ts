import { Request, Response } from "express";
import UserApplicationService from "../service/user.application.service";
import { ApiResponse } from "../utils/ApiResponse";

class UserApplicationController {
    private service: UserApplicationService;
    constructor() {
        this.service = new UserApplicationService()
    }

    async getAllEntries(req: Request, res: Response){
        try {
            const applications = await this.service.getAllApplications()
            return res.status(200).json(new ApiResponse(200, applications, "Entries fetched successfully!"))
        } catch (error) {
            return res.status(500).json(new ApiResponse(500, error, "Something went Wrong!"))
        }
    } 

}

export default UserApplicationController;