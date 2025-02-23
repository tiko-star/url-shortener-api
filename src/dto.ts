"use strict";

export interface User {
    id: number;
    public_id: string;
    name: string;
    email: string;
}

export interface ShortURL {
    public_id: string;
    from: string;
    to: string;
    visits: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}
