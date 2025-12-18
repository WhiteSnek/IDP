import ApplicationRepository from "../repository/application.repo";
import { ApiResponse } from "../utils/ApiResponse";

class OAuthService {
    private appRepository: ApplicationRepository;
    constructor(){
        this.appRepository = new ApplicationRepository();
    }

    async validateClient(clientId: string, redirectUri: string){
        try {
            const client = await this.appRepository.getApplicationByClientId(clientId);
            if(!client){
                return {clientId: null, name: null};
            }
            if(!client.redirectUrls.includes(redirectUri)){
                return {clientId: null, name: null};
            }
            return {clientId: client.clientId, name: client.name};
        } catch (error) {
            console.log(error);
            return {clientId: null, name: null};
        }
    }
}

export default OAuthService;