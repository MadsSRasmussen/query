export type DB = {
    users: {
        id: number;
        name: string;
    };
    posts: {
        id: number;
        content: string;
        user_id: number;
    };
    metadata: {
        id: number;
        user_id: number;
        data: {
            version: number;
            kind: string;
        };
    };
};
