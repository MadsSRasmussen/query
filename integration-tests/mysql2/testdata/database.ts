export type DB = {
    users: {
        id: number;
        name: string;
        created_at: Date;
    };
    posts: {
        id: number;
        content: string;
        user_id: number;
        created_at: Date;
    };
    metadata: {
        id: number;
        user_id: number;
        data: {
            version: number;
            kind: string;
        };
    };
    transactions: {
        id: number;
        data: string;
        _invalid: string;
    };
};

export const DefaultDate = new Date("2025-01-01T10:00:00.000Z");
