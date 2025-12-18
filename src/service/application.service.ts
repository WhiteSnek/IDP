import ApplicationRepository from "../repository/application.repo";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ApiResponse } from "../utils/ApiResponse";
class ApplicationService {
    private repository: ApplicationRepository;
    constructor(){
        this.repository = new ApplicationRepository();
    }

    async registerApplication(name: string, redirectUrls: string[]){
        try {
            const clientId = crypto.randomUUID();
            const rawClientSecret = crypto.randomBytes(32).toString('hex');
            const hashedSecret = await bcrypt.hash(rawClientSecret, 12);
            const application = await this.repository.registerApplication({
                name,
                clientId,
                clientSecret: hashedSecret,
                redirectUrls
            });
            const response = {
                id: application.id,
                name,
                clientId,
                clientSecret: rawClientSecret
            }
            return new ApiResponse(201, response, "Application registered successfully");
        } catch (error) {
            return new ApiResponse(500, error, "Internal Server Error");
        }
    }
}

export default ApplicationService;