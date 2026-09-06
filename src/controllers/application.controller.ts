import { Request, Response } from "express";
import ApplicationService from "../service/application.service";
import { registerApplicationSchema } from "../validation/application.validation";
import NotificationService from "../service/notification.service";

class ApplicationController {
    private service: ApplicationService;
    private notificationService: NotificationService;
    constructor(){
        this.service = new ApplicationService();
        this.notificationService = new NotificationService();
    }

    async registerApplication(req: Request, res: Response) {
        const data = registerApplicationSchema.parse(req.body);
        const response = await this.service.registerApplication(data.name, data.redirectUrls, data.userSyncUrl);
        return res.status(response.statusCode).json(response);
    }

    async getAllApplications(req: Request, res: Response) {
        const response = await this.service.getAllApplications();
        return res.status(response.statusCode).json(response);
    }

    async deleteApplication(req: Request, res: Response){
        const { clientId } = req.params
        const response = await this.service.deleteApplication(clientId)
        return res.status(response.statusCode).json(response)
    }

    async setNotificationPermission(req: Request, res: Response){
        const { clientId } = req.params
        const { canSendNotifications, allowedChannels } = req.body;
        const response = await this.service.setNotificationPermission(clientId,canSendNotifications,allowedChannels)
        return res.status(response.statusCode).json(response)
    }

    async addTemplate(req: Request, res: Response){
        const { subject, eventName, clientId, channel } = req.body;
        const response = await this.notificationService.addTemplate(subject, eventName, clientId, channel)
        return res.status(response.statusCode).json(response)
    }

}

export default ApplicationController;