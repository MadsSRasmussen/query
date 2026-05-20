import type { CompiledMySql } from "@msrass/query/mysql";

import type {
    CompiledQuery,
    DeleteExecutor,
    QueryExecutor,
    TransactionExecutor,
    UpdateExecutor,
    WriteExecutor,
} from "@msrass/query";

import type { MySql2ExecRes, MySql2PoolConnection } from "./executor.ts";

export class MySql2TransactionExecutor
    implements TransactionExecutor<CompiledMySql, MySql2ExecRes> {
    private conn: MySql2PoolConnection;

    constructor(conn: MySql2PoolConnection) {
        this.conn = conn;
    }

    public async begin() {
        await this.conn.beginTransaction();
    }

    public async commit() {
        await this.conn.commit();
        this.conn.release();
    }

    public async rollback() {
        await this.conn.rollback();
        this.conn.release();
    }

    public executeQuery: QueryExecutor<CompiledMySql> = async <R>(
        compiled: CompiledQuery<CompiledMySql, R>,
    ) => {
        const [rows] = await this.conn.query(compiled.sql, compiled.params);

        return rows as unknown as typeof compiled extends
            CompiledQuery<CompiledMySql, infer R> ? R[]
            : never;
    };

    public executeWrite: WriteExecutor<CompiledMySql, MySql2ExecRes> = async (
        compiled,
    ) => {
        const [res] = await this.conn.execute(compiled.sql, compiled.params);

        return {
            id: (res as unknown as { insertId: number }).insertId,
            affected: (res as unknown as { affectedRows: number }).affectedRows,
        };
    };

    public executeUpdate: UpdateExecutor<CompiledMySql, MySql2ExecRes> = async (
        compiled,
    ) => {
        const [res] = await this.conn.execute(
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
        const [res] = await this.conn.execute(
            compiled.sql,
            compiled.params,
        );

        return {
            id: (res as unknown as { insertId: number }).insertId,
            affected: (res as unknown as { affectedRows: number }).affectedRows,
        };
    };
}
