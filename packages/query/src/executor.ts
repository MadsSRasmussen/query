import type { QueryExecutor } from "./query.ts";

/**
 * An interface for executable implementations.
 * This is used by adapter packages as the adapter interface between the external and core libraries.
 */
export interface Executor<T extends unknown> {
    /** A method to execute a query */
    executeQuery: QueryExecutor<T>;
}
