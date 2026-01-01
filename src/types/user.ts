export interface RegisterUser {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    isAdmin: boolean;
}