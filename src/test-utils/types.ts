export type TestDatabase = {
    users: {
        id: number;
        name: string;
        email: string;
        company_id: number;
    };
    messages: {
        id: number;
        content: string;
        user_id: number;
    };
    companies: {
        id: number;
        name: string;
    };
};
