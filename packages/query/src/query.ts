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

export type CompiledQuery<TCompiled, R> = TCompiled & {
    readonly [compiledRowType]?: R;
};

export type QueryCompiler<TCompiled> = <
    T extends Database,
    R = ReturnTable<T, []>,
>(
    query: Query<T, R, TCompiled>,
) => CompiledQuery<TCompiled, R>;

export type QueryExecutor<
    TCompiled,
> = <T, R>(
    compiledQuery: CompiledQuery<TCompiled, R>,
) => Promise<R[]>;

export type QueryConfig<
    TCompiled = unknown,
> = {
    compiler?: Compiler<TCompiled>;
    executor?: Executor<TCompiled>;
};

export class Query<
    T extends Database,
    R = ReturnTable<T, []>,
    TCompiled = unknown,
> {
    private config: QueryConfig<TCompiled> = {};

    public table: (keyof T) | null = null;
    public picks: Picks<T> = [];
    public wheres: [Columns<T>, Flat<T>[Columns<T>], Comparator][] = [];
    public joins: [
        keyof T,
        TableColumns<T, keyof T>,
        Columns<T>,
        Comparator,
    ][] = [];

    constructor(config: Partial<QueryConfig<TCompiled>> = {}) {
        if (config.compiler) {
            this.config.compiler = config.compiler;
        }

        if (config.executor) {
            this.config.executor = config.executor;
        }
    }

    pick<const K extends Picks<T>>(
        ...fields: K
    ): Query<T, ReturnTable<T, K>, TCompiled> {
        this.picks = fields;
        return this as Query<T, ReturnTable<T, K>, TCompiled>;
    }

    from(table: keyof T): Query<T, R, TCompiled> {
        this.table = table;
        return this;
    }

    where<K extends Columns<T>>(
        col: K,
        val: Flat<T>[K],
        comp: Comparator = "=",
    ): Query<T, R, TCompiled> {
        this.wheres.push([col, val, comp]);
        return this;
    }

    join<K extends keyof T>(
        table: K,
        first: TableColumns<T, K>,
        second: Columns<T>,
        comp: Comparator = "=",
    ): Query<T, R, TCompiled> {
        this.joins.push([table, first, second, comp]);
        return this;
    }

    compile(): CompiledQuery<TCompiled, R> {
        if (!this.config.compiler) throw new Error("No compiler specified");
        return this.config.compiler.compileQuery(this);
    }

    async execute(): Promise<R[]> {
        if (!this.config.executor) throw new Error("No executor specified");
        const compiled = this.compile();
        return await this.config.executor.executeQuery(compiled);
    }
}
