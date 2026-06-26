export interface User {
    id?: number;
    username: string;
    email: string;
    password_hash: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: number;
        username: string;
        email: string;
    };
    token: string;
}