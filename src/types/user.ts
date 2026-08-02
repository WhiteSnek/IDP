export interface RegisterUser {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birth: string;
    phone: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    profile: string;
    isAdmin: boolean;
}

export interface UpdateUser {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    profile?: string;
    gender?: string;
    date_of_birth?: string;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
}