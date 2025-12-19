import ApplicationRepository from "../repository/application.repo";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ApiResponse } from "../utils/ApiResponse";
import slugify from "../utils/slugCreater";
class ApplicationService {
    private repository: ApplicationRepository;
    constructor(){
        this.repository = new ApplicationRepository();
    }

    async registerApplication(name: string, redirectUrls: string[]){
        try {
            const clientId = slugify(name) + '-' + Math.random().toString(36).substring(2, 5);
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

    async getApplicationByClientId(clientId: string){
        try {
            const application = await this.repository.getApplicationByClientId(clientId);
            if(!application){
                return null;
            }
            return application;
        } catch (error) {
            throw error;
        }
    }
}

export default ApplicationService;