import ApplicationRepository from "../repository/application.repo";
import AuthCodeRepository from "../repository/authcode.repo";
import bcrypt from 'bcrypt';

class OAuthService {
    private appRepository: ApplicationRepository;
    private authcodeRepository: AuthCodeRepository;
    constructor(){
        this.appRepository = new ApplicationRepository();
        this.authcodeRepository = new AuthCodeRepository();
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
            return {clientId: client.clientId, name: client.name, id: client.id};
        } catch (error) {
            return {clientId: null, name: null, id: null};
        }
    }

    async generateAuthCode(code: string, clientId: string, redirectUri: string, userId: string, state: string){
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.authcodeRepository.createAuthCode({
            code,
            clientId,
            redirectUri,
            userId,
            expiresAt,
            state
        })
    }

    async validateAuthCode(code: string, clientId: string, redirectUri: string){
        const authCode = await this.authcodeRepository.getAuthCodeByCode(code);
        if(!authCode){
            return null;
        }
        if(authCode.clientId !== clientId || authCode.redirectUri !== redirectUri){
            return null;
        }
        if(authCode.expiresAt < new Date() || authCode.used){
            return null;
        }
        await this.authcodeRepository.useAuthCode(code);
        return authCode;
    }

    async validateClientBySecret(clientId: string, clientSecret: string){
        const client = await this.appRepository.getApplicationByClientId(clientId);
        if(!client){
            return false;
        }
        const isValid = bcrypt.compare(clientSecret, client.clientSecret);
        return isValid;
    }
}

export default OAuthService;