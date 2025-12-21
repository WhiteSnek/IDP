import UserApplicationRepository from "../repository/user.application.repo";
import { RegisterUserApplication } from "../types/application";

class UserApplicationService {
    private repository: UserApplicationRepository
    constructor(){
        this.repository = new UserApplicationRepository()
    }

    async registerApplication(userId: string, applicationId: string){
        const application = await this.repository.getApplicationByUserAndApplicationId(userId, applicationId)
        if(application){
            return;
        }
        const payload: RegisterUserApplication = {
            userId,
            applicationId
        }
        await this.repository.registerApplication(payload)
    }

    async getAllApplications(){
        return this.repository.getAllApplications()
    }

    async getUserApplications(userId: string){
        return this.repository.getUserApplications(userId)
    }
}

export default UserApplicationService;