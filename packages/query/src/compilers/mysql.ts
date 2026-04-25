/**
 * MySQL-specific implementations module.
 *
 * @example
 * ```ts
 * import { Store } from '@msrass/query';
 * import { MySqlCompiler } from '@msrass/query/mysql';
 *
 * type Database = {
 *     users: { id: number; name: string };
 *     posts: { id: number; content: string; user_id: number };
 * };
 *
 * const store = new Store<Database>().withCompiler(new MySqlCompiler());
 * const compiled = store.query('users').pick('users.id').compile();
 * ```
 *
 * @module mysql
 */

import type { Buffer } from "node:buffer";
import type { QueryCompiler } from "../query.ts";
import type { WriteCompiler } from "../write.ts";
import type { Compiler } from "./types.ts";

export type SqlPrimitive = string | number | boolean | null | Buffer | Date;
export type SqlValues =
    | SqlPrimitive
    | SqlPrimitive[]
    | Record<string, SqlPrimitive>;

export type CompiledMySql = {
    sql: string;
    params: SqlValues[];
};

/**
 * MySQL compiler to translate inputs into executable SQL syntax.
 */
export class MySqlCompiler implements Compiler<CompiledMySql> {
    public compileQuery: QueryCompiler<CompiledMySql> = ((query) => {
        const queryBits = [];

        if (query.picks.length) {
            const picks = query.picks.map((pick) => {
                if (Array.isArray(pick)) {
                    const [col, alias] = pick;
                    return `${this.quoteCol(col)} AS ${alias}`;
                }
                const [table, col] = pick.split(".");
                return `${this.quote(table)}.${this.quote(col)}`;
            });

            const select = `SELECT ${picks.join(", ")} FROM ${
                this.quote(String(query.table))
            }`;
            queryBits.push(select);
        } else {
            queryBits.push(`SELECT * FROM ${this.quote(String(query.table))}`);
        }

        if (query.joins.length) {
            const joins = query.joins.map(([table, first, second, comp]) => {
                return `JOIN ${this.quote(String(table))} ON ${
                    this.quoteCol(first)
                } ${comp} ${this.quoteCol(second)}`;
            }).join("\n");

            queryBits.push(joins);
        }

        const params: unknown[] = [];
        if (query.wheres.length) {
            const clauses = query.wheres.map(([col, val, comp]) => {
                if (val === null) {
                    return `${this.quoteCol(col)} IS ${
                        comp === "!=" ? "NOT" : ""
                    } NULL`;
                }

                params.push(val);
                return `${this.quoteCol(col)} ${comp} ?`;
            });

            const wheres = `WHERE ${clauses.join("\nAND ")}`;
            queryBits.push(wheres);
        }

        return {
            sql: queryBits.join("\n"),
            params: params as SqlValues[],
        };
    });

    public compileWrite: WriteCompiler<CompiledMySql> = ((write) => {
        const writeBits = [];

        if (write.data === null) {
            throw new Error("No data associated with Write instance");
        }

        const insert = `INSERT INTO ${this.quote(String(write.table))}`;
        const keys = Array.isArray(write.data)
            ? Object.keys(write.data[0])
            : Object.keys(write.data);
        writeBits.push(
            `${insert} (${keys.map((key) => this.quote(key)).join(", ")})`,
        );

        if (!Array.isArray(write.data) && write.data !== null) {
            const values = `VALUES (${keys.map((_) => "?").join(", ")})`;
            writeBits.push(values);
        } else {
            const vals = write.data.map(() =>
                `(${keys.map(() => "?").join(", ")})`
            );
            writeBits.push(`VALUES\n${vals.join(",\n")}`);
        }

        if (write.method == "upsert") {
            writeBits.push("ON DUPLICATE KEY UPDATE");
            const updates = keys.map((key) =>
                `${key} = VALUES(${this.quote(key)})`
            );
            writeBits.push(updates.join(",\n"));
        }

        let params: unknown[] = [];

        if (Array.isArray(write.data)) {
            params = write.data.map((d) => keys.map((key) => d[key])).flat();
        } else {
            const data = write.data as Record<string, unknown>;
            params = keys.map((key) => data[key]);
        }

        return {
            sql: writeBits.join("\n"),
            params: params.flat() as SqlValues[],
        };
    });

    private quote(input: string): string {
        return `\`${input}\``;
    }

    private quoteCol(input: string): string {
        const [table, col] = input.split(".");
        return `${this.quote(table)}.${this.quote(col)}`;
    }
}
