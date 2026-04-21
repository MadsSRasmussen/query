import type { Compiler } from "./compilers/types.ts";
import type {
    Columns,
    Comparator,
    Database,
    Flat,
    Picks,
    ReturnTable,
    TableColumns,
} from "./types.ts";
import type { Executor } from "./executor.ts";

declare const compiledRowType: unique symbol;

/**
 * Represents a compiled query that is ready for execution.
 *
 * This type combines:
 * - The compiled query representation (e.g. SQL string + parameters)
 * - The inferred result row type
 *
 * The row type is stored using a hidden symbol to preserve type safety
 * across compilation and execution.
 *
 * @typeParam TCompiled - The compiled query format (e.g. SQL string + params)
 * @typeParam R - The inferred result row type
 */
export type CompiledQuery<TCompiled, R> = TCompiled & {
    readonly [compiledRowType]?: R;
};

/**
 * Compiles a query into a database-specific representation.
 *
 * A compiler transforms a `Query` into something executable,
 * such as a SQL string with parameters.
 *
 * @typeParam TCompiled - The output format of the compiled query
 */
export type QueryCompiler<TCompiled> = <
    T extends Database,
    R = ReturnTable<T, []>,
>(
    query: Query<T, R, TCompiled>,
) => CompiledQuery<TCompiled, R>;

/**
 * Executes a compiled query against a database.
 *
 * The executor receives a compiled query and returns
 * the result rows with full type safety.
 *
 * @typeParam TCompiled - The compiled query format
 */
export type QueryExecutor<
    TCompiled,
> = <_, R>(
    compiledQuery: CompiledQuery<TCompiled, R>,
) => Promise<R[]>;

/**
 * Configuration for attaching execution capabilities to a `Store`.
 *
 * A query can only be executed if both:
 * - a compiler (to transform the query)
 * - an executor (to run it)
 *
 * are provided.
 *
 * @typeParam TCompiled - The compiled query format shared between compiler and executor
 */
export type QueryConfig<
    TCompiled = unknown,
> = {
    compiler?: Compiler<TCompiled>;
    executor?: Executor<TCompiled>;
};

/**
 * A class which enables the construction of queries.
 * These queries can later be transformed into concrete SQL and executed.
 *
 * @example
 * ```ts
 * const query = new Query<{ users: { id: number, name: string } }>()
 *     .from('users') // The main table to query from
 *     .pick('users.id', 'users.name') // The picks from any joined table
 *     .where('users.id', 1); // A clause narrowing the result
 * ```
 */
export class Query<
    T extends Database,
    R = ReturnTable<T, []>,
    TCompiled = unknown,
> {
    private config: QueryConfig<TCompiled> = {};

    /** The list of table names that are to be selected. */
    public table: (keyof T) | null = null;
    /** The fields that are to be selected in the query. */
    public picks: Picks<T> = [];
    /** The list of where clauses to be applied to the query. */
    public wheres: [Columns<T>, Flat<T>[Columns<T>], Comparator][] = [];
    /** The set of tables joined to the main table in the query */
    public joins: [
        keyof T,
        TableColumns<T, keyof T>,
        Columns<T>,
        Comparator,
    ][] = [];

    /**
     * Create a new `Query` instance.
     * Optionally include a compiler and an executor in the configuration passed to the constructor.
     * @param [config={}] The query configuration. Include a compiler and executor here.
     */
    constructor(config: Partial<QueryConfig<TCompiled>> = {}) {
        if (config.compiler) {
            this.config.compiler = config.compiler;
        }

        if (config.executor) {
            this.config.executor = config.executor;
        }
    }

    /**
     * Select exactly which fields to query.
     * @param fields A list of valid fields to select. Alias via: `['users.id', 'user_id']`.
     */
    pick<const K extends Picks<T>>(
        ...fields: K
    ): Query<T, ReturnTable<T, K>, TCompiled> {
        this.picks = fields;
        return this as Query<T, ReturnTable<T, K>, TCompiled>;
    }

    /**
     * Select a base table to query from.
     * @param table The name of the base table to query from.
     */
    from(table: keyof T): Query<T, R, TCompiled> {
        this.table = table;
        return this;
    }

    /**
     * Specify a where clause to restrict the query.
     * @param col The column to compare the value against.
     * @param val The value to compare the column to.
     * @param [comp="="] An optional comparator symbol.
     */
    where<K extends Columns<T>>(
        col: K,
        val: Flat<T>[K],
        comp: Comparator = "=",
    ): Query<T, R, TCompiled> {
        this.wheres.push([col, val, comp]);
        return this;
    }

    /**
     * Join a table to the current query.
     * @param table The name of the table to join.
     * @param first The first term in the join condition.
     * @param second The second term in the join condition.
     * @param [comp="="] An optional comparator symbol.
     */
    join<K extends keyof T>(
        table: K,
        first: TableColumns<T, K>,
        second: Columns<T>,
        comp: Comparator = "=",
    ): Query<T, R, TCompiled> {
        this.joins.push([table, first, second, comp]);
        return this;
    }

    /**
     * Compile the query with the compiler associated with this particular `Query` instance.
     */
    compile(): CompiledQuery<TCompiled, R> {
        if (!this.config.compiler) throw new Error("No compiler specified");
        return this.config.compiler.compileQuery(this);
    }

    /**
     * Compile and execute the query with the compiler and executor associated with this particular `Query` instance.
     */
    async execute(): Promise<R[]> {
        if (!this.config.executor) throw new Error("No executor specified");
        const compiled = this.compile();
        return await this.config.executor.executeQuery(compiled);
    }
}
