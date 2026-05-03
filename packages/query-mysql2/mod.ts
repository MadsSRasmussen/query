/**
 * ```ts
 * import { Store } from "@msrass/query";
 *
 * import { MySqlCompiler } from "@msrass/query/mysql";
 * import { MySql2Executor } from "@msrass/query-mysql2";
 *
 * import mysql2 from "mysql2/promise";
 *
 * const pool = mysql2.createPool({
 *     host: 'localhost',
 *     user: 'root',
 *     password: 'root',
 *     database: 'test',
 * });
 *
 * const compiler = new MySqlCompiler();
 * const executor = new MySql2Executor(pool);
 *
 * type Database = {
 *     users: { id: number; name: string };
 *     posts: { id: number; content: string; user_id: number };
 * };
 *
 * const store = new Store<Database>().withExecutor(compiler, executor);
 *
 * // The query can be now be crafted.
 * const query = store.query("posts")
 *     .join('users', 'users.id', 'posts.user_id')
 *     .pick(['users.id', 'user_id'], 'users.name', 'posts.content', 'posts.id')
 *     .where('users.id', 1);
 *
 * // And executed.
 * const posts = await query.execute();
 *
 * console.log(posts);
 * ```
 *
 * @module
 */

import type { CompiledMySql, SqlValues } from "@msrass/query/mysql";
import type {
    CompiledQuery,
    DeleteExecutor,
    Executor,
    QueryExecutor,
    UpdateExecutor,
    WriteExecutor,
} from "@msrass/query";

interface MySql2Pool {
    query(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    execute(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
    getConnection(): Promise<MySql2PoolConnection>;
}

interface MySql2PoolConnection {
    release(): void;
    query(sql: string, values?: SqlValues[]): Promise<[unknown, unknown]>;
}

type MySql2ExecRes = {
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
export class MySql2Executor implements Executor<CompiledMySql, MySql2ExecRes> {
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
}
