import { Request, Response } from "express";
import ApplicationService from "../service/application.service";
import { registerApplicationSchema } from "../validation/application.validation";

class ApplicationController {
    private service: ApplicationService;
    constructor(){
        this.service = new ApplicationService();
    }

    async registerApplication(req: Request, res: Response) {
        const data = registerApplicationSchema.parse(req.body);
        const response = await this.service.registerApplication(data.name, data.redirectUrls);
        return res.status(response.statusCode).json(response);
    }
}

export default ApplicationController;