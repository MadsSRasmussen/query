import type { CompiledMySql } from "@msrass/query/mysql";
import type { CompiledQuery, Executor, QueryExecutor } from "@msrass/query";
import type { Buffer } from "node:buffer";

type SqlPrimitive = string | number | boolean | null | Buffer | Date;
type SqlValues = SqlPrimitive | SqlPrimitive[] | Record<string, SqlPrimitive>;

export interface MySql2Pool {
    query(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    execute(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    getConnection(): Promise<MySql2PoolConnection>;
}

export interface MySql2PoolConnection {
    release(): void;
    query(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
}

export class MySql2Executor implements Executor<CompiledMySql> {
    private pool: MySql2Pool;

    constructor(pool: MySql2Pool) {
        this.pool = pool;
    }

    public executeQuery: QueryExecutor<CompiledMySql> = async <R>(
        compiled: CompiledQuery<CompiledMySql, R>,
    ) => {
        const [rows] = await this.pool.query(compiled.query, compiled.params);

        return rows as unknown as typeof compiled extends
            CompiledQuery<CompiledMySql, infer R> ? R[]
            : never;
    };
}
