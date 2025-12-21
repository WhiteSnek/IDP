
export interface RegisterApplication {
    name: string;
    redirectUrls: string[];
    clientId: string;
    clientSecret: string;
}


export interface RegisterUserApplication {
    userId: string;
    applicationId: string;
}