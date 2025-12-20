export interface RegisterUser {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_no: string;
    ISD_code: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_no: string;
    ISD_code: string;
    isAdmin: boolean;
}