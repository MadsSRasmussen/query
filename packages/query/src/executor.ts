import type { QueryExecutor } from "./query.ts";
import type { WriteExecutor } from "./write.ts";
import type { UpdateExecutor } from "./update.ts";
import type { DeleteExecutor } from "./delete.ts";

/**
 * An interface for executable implementations.
 * This is used by adapter packages as the adapter interface between the external and core libraries.
 */
export interface Executor<
    Compiled extends unknown,
    ExecRes extends unknown,
> {
    /** A method to execute a query */
    executeQuery: QueryExecutor<Compiled>;

    /** A method to execute a write */
    executeWrite: WriteExecutor<Compiled, ExecRes>;

    /** A method to execute an update */
    executeUpdate: UpdateExecutor<Compiled, ExecRes>;

    /** A method to execute a delete */
    executeDelete: DeleteExecutor<Compiled, ExecRes>;
}
