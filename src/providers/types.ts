import type { Database } from "../query/types.ts";
import type { Query } from "../query/query.ts";

export interface DatabaseProvider<T extends Database> {
    query(): Query<T>;
    execute<R>(q: Query<T, R> | string): Promise<R[]>;
    connect(): Promise<void>;
    close(): Promise<void>;
}
