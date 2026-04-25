import type { QueryExecutor } from "./query.ts";
import type { WriteExecutor } from "./write.ts";

/**
 * An interface for executable implementations.
 * This is used by adapter packages as the adapter interface between the external and core libraries.
 */
export interface Executor<
    Compiled extends unknown,
    WriteRes extends unknown,
> {
    /** A method to execute a query */
    executeQuery: QueryExecutor<Compiled>;

    /** A method to execute a write */
    executeWrite: WriteExecutor<Compiled, WriteRes>;
}
