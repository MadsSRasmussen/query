import type { CompiledMySql, SqlValues } from "@msrass/query/mysql";
import type {
    CompiledQuery,
    DeleteExecutor,
    QueryExecutor,
    TransactionalExecutor,
    TransactionExecutor,
    UpdateExecutor,
    WriteExecutor,
} from "@msrass/query";

import { MySql2TransactionExecutor } from "./transaction.ts";

export interface MySql2Pool {
    query(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    execute(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    getConnection(): Promise<MySql2PoolConnection>;
}

export interface MySql2PoolConnection {
    release(): void;
    query(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    execute(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

export type MySql2ExecRes = {
    id: unknown;
    affected: number;
};

/**
 * MySQL execution adapter for the npm:mysql2/promise package.
 *
 * @example
 * ```ts
 * import mysql2 from 'npm:mysql2/promise';
 * import { MySql2Executor } from '@msrass/query-mysql2';
 *
 * const pool = mysql2.createPool({
 *     host: 'localhost',
 *     user: 'root',
 *     password: 'root',
 *     database: 'test',
 * });
 *
 * const executor = new MySql2Executor(pool);
 * ```
 */
export class MySql2Executor
    implements TransactionalExecutor<CompiledMySql, MySql2ExecRes> {
    private pool: MySql2Pool;

    constructor(pool: MySql2Pool) {
        this.pool = pool;
    }

    public executeQuery: QueryExecutor<CompiledMySql> = async <R>(
        compiled: CompiledQuery<CompiledMySql, R>,
    ) => {
        const [rows] = await this.pool.query(compiled.sql, compiled.params);

        return rows as unknown as typeof compiled extends
            CompiledQuery<CompiledMySql, infer R> ? R[]
            : never;
    };

    public executeWrite: WriteExecutor<CompiledMySql, MySql2ExecRes> = async (
        compiled,
    ) => {
        const [res] = await this.pool.execute(compiled.sql, compiled.params);

        return {
            id: (res as unknown as { insertId: number }).insertId,
            affected: (res as unknown as { affectedRows: number }).affectedRows,
        };
    };

    public executeUpdate: UpdateExecutor<CompiledMySql, MySql2ExecRes> = async (
        compiled,
    ) => {
        const [res] = await this.pool.execute(
            compiled.sql,
            compiled.params,
        );

        return {
            id: (res as unknown as { insertId: number }).insertId,
            affected: (res as unknown as { affectedRows: number }).affectedRows,
        };
    };

    public executeDelete: DeleteExecutor<CompiledMySql, MySql2ExecRes> = async (
        compiled,
    ) => {
        const [res] = await this.pool.execute(
            compiled.sql,
            compiled.params,
        );

        return {
            id: (res as unknown as { insertId: number }).insertId,
            affected: (res as unknown as { affectedRows: number }).affectedRows,
        };
    };

    public async transaction(): Promise<
        TransactionExecutor<CompiledMySql, MySql2ExecRes>
    > {
        const conn = await this.pool.getConnection();
        return new MySql2TransactionExecutor(conn);
    }
}
