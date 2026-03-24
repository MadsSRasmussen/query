import type { QueryExecutor } from "./query.ts";

export interface Executor<T extends unknown> {
    executeQuery: QueryExecutor<T>;
}
