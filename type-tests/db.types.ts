export type UserRole = "none" | "default" | "admin";

export type DB = {
    organisations: {
        id: number;
        name: string;
        created_at: Date;
    };
    users: {
        id: number;
        name: string;
        email: string;
        created_at: Date;
    };
    user_roles: {
        organisation_id: number;
        user_id: number;
        role: UserRole;
    };
};
