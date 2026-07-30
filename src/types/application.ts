
export interface RegisterApplication {
    name: string;
    redirectUrls: string[];
    clientId: string;
    clientSecret: string;
    userSyncUrl: string;
    userSyncSecret: string;
}


export interface RegisterUserApplication {
    userId: string;
    applicationId: string;
}