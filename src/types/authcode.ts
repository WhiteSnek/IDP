export interface AuthCode {
    code: string;
    clientId: string;
    redirectUri: string;
    userId: string;
    expiresAt: Date;
    state: string;
}

export interface TokenData {
    grant_type: string;
    code: string;
    redirect_uri: string;
    client_id: string;
    client_secret: string;
}