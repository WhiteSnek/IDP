import { Request, Response } from "express";
import OAuthService from "../service/oauth.service";

class OAuthController {
    private service: OAuthService;
    constructor(){
        this.service = new OAuthService();
    }
    async authorize(req: Request, res: Response){
        const params = req.query;
        const client = this.service.validateClient(
            params.client_id as string,
            params.redirect_uri as string
        );
        
        return res.status(200).json({ message: "Authorization endpoint", params });
    }
}

export default OAuthController;