import type { Compiler } from "./compilers/types.ts";
import type { Executor } from "./executor.ts";
import type { Database, UnionToIntersection } from "./types.ts";

type WriteMethod = "insert" | "upsert";

/**
 * Configuration for attaching execution capabilities to a `Write`.
 * A compiler is required to compile writes.
 * An executor is additionally required to execute writes.
 *
 * @typeParam TCompiled - The output format of the compiled write.
 * @typeParam R - The response format of a write event from the executor.
 */
export type WriterConfig<
    TCompiled = unknown,
    R = unknown,
> = {
    compiler?: Compiler<TCompiled>;
    executor?: Executor<TCompiled, R>;
    method: WriteMethod;
};

/**
 * Compiles a write into a database-specific representation.
 *
 * A compiler transforms a `Write` into something executable,
 * such as a SQL string with parameters.
 *
 * @typeParam TCompiled - The output format of the compiled write
 */
export type WriteCompiler<TCompiled> = <
    T extends Database,
>(
    write: Write<T, TCompiled>,
) => TCompiled;

/**
 * Executes a compiled write against a database.
 *
 * @typeParam TCompiled - The output format of the compiled write.
 * @typeParam R - The response format of a write event from the executor.
 */
export type WriteExecutor<
    TCompiled,
    R,
> = (
    compiledWrite: TCompiled,
) => Promise<R>;

/**
 * A class which enables the construction of writes.
 * These writes can later be transformed into concrete SQL and executed.
 *
 * ```ts
 * const write = new Write<{ users: { id: number, name: string } }>()
 *     .into('users') // The main table to write to
 *     .one({ name: 'John' });
 * ```
 */
export class Write<
    DB extends Database,
    TCompiled = unknown,
    R = unknown,
    TB extends keyof DB = keyof DB,
> {
    private config: WriterConfig<TCompiled, R> = {
        method: "insert",
    };

    /** The base table to write to. */
    public table: (keyof DB) | null = null;
    /** The data to be inserted. */
    public data: Partial<DB[TB]> | Partial<DB[TB]>[] | null = null;

    /**
     * Create a new `Write` instance.
     * Optionally include a compiler and an executor in the configuration passed to the constructor.
     * You may also specify a method: "insert" | "upsert", "insert" is the default method.
     * @param [config={}] The write configuration.
     */
    constructor(config: Partial<WriterConfig<TCompiled, R>> = {}) {
        if (config.method) this.config.method = config.method;
        if (config.compiler) this.config.compiler = config.compiler;
        if (config.executor) this.config.executor = config.executor;
    }

    /**
     * Specify which table to write data to.
     * @param table The name of the table to write to.
     */
    into<Table extends keyof DB>(
        table: Table,
    ): Write<DB, TCompiled, R, Table> {
        this.table = table;
        return this as unknown as Write<DB, TCompiled, R, Table>;
    }

    /**
     * Insert a single element into the table.
     * @param data The data to be inserted into the table.
     */
    one(data: Partial<DB[TB]>): Write<DB, TCompiled, R, TB> {
        this.data = data;
        return this;
    }

    /**
     * Insert a list of elements into the table.
     * @param data The data to be inserted into the table.
     */
    arr<T extends Partial<DB[TB]>>(
        data: T[] & Array<UnionToIntersection<T>>,
    ): Write<DB, TCompiled, R, TB> {
        this.data = data;
        return this;
    }

    /**
     * Compile the write with the compiler associated with the `Write` instance.
     */
    compile(): TCompiled {
        if (!this.config.compiler) throw new Error("No compiler specified");
        return this.config.compiler.compileWrite(this);
    }

    /**
     * Compile and execute the write with the compiler and executor associated with this particular `Write` instance.
     */
    async execute(): Promise<R> {
        if (!this.config.executor) throw new Error("No executor specified");
        const compiled = this.compile();
        return await this.config.executor.executeWrite(compiled);
    }

    /** The write method (`insert` or `upsert`). */
    public get method(): WriteMethod {
        return this.config.method;
    }
}
