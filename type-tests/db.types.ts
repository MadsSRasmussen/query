export type UserRole = "none" | "default" | "admin";

export type DB = {
    organisations: {
        id: number;
        name: string;
    };
    users: {
        id: number;
        name: string;
        email: string;
    };
    user_roles: {
        organisation_id: number;
        user_id: number;
        role: UserRole;
    };
};
