import type { Compiler } from "./compilers/types.ts";
import { NoClauseError } from "./errors.ts";
import type { Executor } from "./executor.ts";
import type { Comparator, Database, Flat, TableColumns } from "./types.ts";

/**
 * Configuration for attaching execution capabilities to an `Update`.
 * Both a compiler and an executor must be provided for execution.
 *
 * @typeParam TCompiled - The compiled update format shared between compiler and executor
 */
export type UpdateConfig<
    TCompiled = unknown,
    R = unknown,
> = {
    compiler?: Compiler<TCompiled>;
    executor?: Executor<TCompiled, R>;
};

/**
 * Compiles an update into a database-specific representation.
 *
 * A compiler transforms an `Update` into something executable,
 * such as a SQL string with parameters.
 *
 * @typeParam TCompiled - The output format of the compiled update
 */
export type UpdateCompiler<TCompiled> = <
    T extends Database,
    TC,
    TR,
    TTB extends keyof T,
>(
    update: Update<T, TC, TR, TTB>,
) => TCompiled;

/**
 * Executes a compiled update against a database.
 *
 * The executor receives a compiled update and returns
 * an execution result.
 *
 * @typeParam TCompiled - The compiled update format
 */
export type UpdateExecutor<
    TCompiled,
    R,
> = (
    compiledUpdate: TCompiled,
) => Promise<R>;

/**
 * A class which enables the construction of updates.
 * These updates can later be transformed into concrete SQL and executed.
 *
 * ```ts
 * const update = new Update<{ users: { id: number, name: string } }>()
 *     .into('users') // The main table to update into
 *     .set({ name: 'John' }) // The data to set into the table
 *     .where('users.id', 1); // A clause narrowing the update
 * ```
 */
export class Update<
    DB extends Database,
    TCompiled = unknown,
    R = unknown,
    TB extends keyof DB = keyof DB,
> {
    private config: UpdateConfig<TCompiled, R> = {};
    private ignoreMissingClause = false;

    /** The base table to write to. */
    public table: (keyof DB) | null = null;

    /** The list of where clauses to be applied to the query. */
    public wheres: [
        TableColumns<DB, TB>,
        Flat<DB>[TableColumns<DB, TB>],
        Comparator,
    ][] = [];

    /** The data to be inserted. */
    public data: Partial<DB[TB]> | null = null;

    /**
     * Create a new `Update` instance.
     * Optionally include a compiler and an executor in the configuration passed to the constructor.
     * @param [config={}] The update configuration. Include a compiler and executor here.
     */
    constructor(config: UpdateConfig<TCompiled, R> = {}) {
        if (config.compiler) this.config.compiler = config.compiler;
        if (config.executor) this.config.executor = config.executor;
    }

    /**
     * Specify which table to update data into.
     * @param table The name of the table to update into.
     */
    into<T extends keyof DB>(
        table: T,
    ): Update<DB, TCompiled, R, T> {
        this.table = table;
        return this as unknown as Update<DB, TCompiled, R, T>;
    }

    /**
     * Specify key value pairs of the table to set.
     * @param data The data to be set.
     */
    set(data: Partial<DB[TB]>): Update<DB, TCompiled, R, TB> {
        this.data = data;
        return this;
    }

    /**
     * Specify a where clause to restrict the update.
     * @param col The column to compare the value against.
     * @param val The value to compare the column to.
     * @param [comp="="] An optional comparator symbol.
     */
    where<K extends TableColumns<DB, TB>>(
        col: K,
        val: Flat<DB>[K],
        comp: Comparator = "=",
    ): Update<DB, TCompiled, R, TB> {
        this.wheres.push([col, val, comp]);
        return this;
    }

    /**
     * Explicitly ignore no clauses.
     *
     * This avoids the safety mechanism, not letting an update compile,
     * if no where clauses are set.
     */
    explicitNoClause(): Update<DB, TCompiled, R, TB> {
        this.ignoreMissingClause = true;
        return this;
    }

    /**
     * Compile the update with the compiler associated with the `Update` instance.
     */
    compile(): TCompiled {
        if (this.wheres.length == 0 && !this.ignoreMissingClause) {
            throw new NoClauseError(
                "No clause specified and explicitNoClause is not set",
            );
        }
        if (!this.config.compiler) throw new Error("No compiler specified");
        return this.config.compiler.compileUpdate(this);
    }

    /**
     * Compile and execute the update with the compiler and executor associated with the `Update` instance.
     */
    async execute(): Promise<R> {
        if (!this.config.executor) throw new Error("No executor specified");
        const compiled = this.compile();
        return await this.config.executor.executeUpdate(compiled);
    }
}
