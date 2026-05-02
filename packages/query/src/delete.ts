import type { Compiler } from "./compilers/types.ts";
import type { Executor } from "./executor.ts";
import { NoClauseError } from "./errors.ts";
import type { Comparator, Database, Flat, TableColumns } from "./types.ts";

/**
 * Configuration for attaching execution capabilities to a `Delete`.
 * Both a compiler and an executor must be provided for execution.
 *
 * @typeParam TCompiled - The compiled delete format shared between compiler and executor
 */
export type DeleteConfig<
    TCompiled = unknown,
    R = unknown,
> = {
    compiler?: Compiler<TCompiled>;
    executor?: Executor<TCompiled, R>;
};

/**
 * Compiles a delete into a database-specific representation.
 *
 * A compiler transforms a `Delete` into something executable,
 * such as a SQL string with parameters.
 *
 * @typeParam TCompiled - The output format of the compiled delete
 */
export type DeleteCompiler<TCompiled> = <
    T extends Database,
    TC,
    TR,
    TTB extends keyof T,
>(
    del: Delete<T, TC, TR, TTB>,
) => TCompiled;

/**
 * Executes a compiled delete against a database.
 *
 * The executor receives a compiled delete and returns
 * an execution result.
 *
 * @typeParam TCompiled - The compiled delete format
 */
export type DeleteExecutor<
    TCompiled,
    R,
> = (
    compiledDelete: TCompiled,
) => Promise<R>;

/**
 * A class which enables the construction of deletes.
 * These deletes can later be transformed into concrete SQL and executed.
 *
 * ```ts
 * const del = new Delete<{ users: { id: number, name: string } }>()
 *     .from('users') // The main table to delete from
 *     .where('users.id', 1); // A clause narrowing the delete
 * ```
 */
export class Delete<
    DB extends Database,
    TCompiled = unknown,
    R = unknown,
    TB extends keyof DB = keyof DB,
> {
    private config: DeleteConfig<TCompiled, R> = {};
    private ignoreMissingClause = false;

    /** The base table to delete from. */
    public table: (keyof DB) | null = null;

    /** The list of where clauses to be applied to the delete. */
    public wheres: [
        TableColumns<DB, TB>,
        Flat<DB>[TableColumns<DB, TB>],
        Comparator,
    ][] = [];

    /**
     * Create a new `Delete` instance.
     * Optionally include a compiler and an executor in the configuration passed to the constructor.
     * @param [config={}] The delete configuration. Include a compiler and executor here.
     */
    constructor(config: DeleteConfig<TCompiled, R> = {}) {
        if (config.compiler) this.config.compiler = config.compiler;
        if (config.executor) this.config.executor = config.executor;
    }

    /**
     * Specify which table to delete data from.
     * @param table The name of the table to delete from.
     */
    from<T extends keyof DB>(
        table: T,
    ): Delete<DB, TCompiled, R, T> {
        this.table = table;
        return this as unknown as Delete<DB, TCompiled, R, T>;
    }

    /**
     * Specify a where clause to restrict the delete.
     * @param col The column to compare the value against.
     * @param val The value to compare the column to.
     * @param [comp="="] An optional comparator symbol.
     */
    where<K extends TableColumns<DB, TB>>(
        col: K,
        val: Flat<DB>[K],
        comp: Comparator = "=",
    ): Delete<DB, TCompiled, R, TB> {
        this.wheres.push([col, val, comp]);
        return this;
    }

    /**
     * Explicitly ignore no clauses.
     *
     * This avoids the safety mechanism, not letting a delete compile,
     * if no where clauses are set.
     */
    explicitNoClause(): Delete<DB, TCompiled, R, TB> {
        this.ignoreMissingClause = true;
        return this;
    }

    /**
     * Compile the delete with the compiler associated with the `Delete` instance.
     */
    compile(): TCompiled {
        if (this.wheres.length == 0 && !this.ignoreMissingClause) {
            throw new NoClauseError(
                "No clause specified and explicitNoClause is not set",
            );
        }
        if (!this.config.compiler) throw new Error("No compiler specified");
        return this.config.compiler.compileDelete(this);
    }

    /**
     * Compile and execute the delete with the compiler and executor associated with the `Delete` instance.
     */
    async execute(): Promise<R> {
        if (!this.config.executor) throw new Error("No executor specified");
        const compiled = this.compile();
        return await this.config.executor.executeDelete(compiled);
    }
}
