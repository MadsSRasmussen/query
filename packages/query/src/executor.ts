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

/**
 * An interface used to specify an Executor that supports transactional connections.
 * This is used by adapter packages to return a transactionable connection.
 */
export interface TransactionalExecutor<
    Compiled extends unknown,
    ExecRes extends unknown,
> extends Executor<Compiled, ExecRes> {
    /** A method to return a TransactionExecutor */
    transaction(): Promise<TransactionExecutor<Compiled, ExecRes>>;
}

/**
 * An interface used for transactional executions.
 * This is used by adapter packages, often operating on a single connection
 */
export interface TransactionExecutor<
    Compiled extends unknown,
    ExecRes extends unknown,
> extends Executor<Compiled, ExecRes> {
    /** A method to begin a transaction */
    begin(): Promise<void>;

    /** A method to commit a transaction */
    commit(): Promise<void>;

    /** A method to rollback a transaction */
    rollback(): Promise<void>;
}
