import type { Database, ReturnTable } from "./types.ts";
import type { Compiler } from "./compilers/types.ts";

import { Query } from "./query.ts";
import { Write } from "./write.ts";

import type { Executor } from "@msrass/query";

/**
 * A class that enables operations on databases.
 *
 * @example
 * ```ts
 * const store = new Store<{ users: { id: number, name: string } }>();
 *
 * // Example: Creating a query from a store:
 * const query = store.query('users') // The base table to query from
 *     .pick('users.id', 'users.name') // The fields to query
 *     .where('users.id', 1); // A clause narrowing the result
 * ```
 */
export class Store<
    T extends Database,
> {
    /** Create a new `Store` instance. */
    constructor() {}

    /**
     * Create a `Query` instance that queries from the specified base table.
     * @param table The name of the base table to query from.
     */
    query(table: keyof T): Query<T, ReturnTable<T, []>> {
        const query = new Query<T, ReturnTable<T, []>>();
        return query.from(table);
    }

    /**
     * Create a `Write` instance with mode: "insert", to insert data into the table specified.
     * @param table The name of the base table to insert into.
     */
    insert(table: keyof T): Write<T> {
        const write = new Write<T>({ method: "insert" });
        return write.into(table);
    }

    /**
     * Create a `Write` instance with mode: "upsert", to upsert data into the table specified.
     * @param table The name of the base table to upsert into.
     */
    upsert(table: keyof T): Write<T> {
        const write = new Write<T>({ method: "upsert" });
        return write.into(table);
    }

    /**
     * Returns a newly typed instance of `Store` with a specified compiler.
     * This ensures correct type inference of compiled queries.
     * @param compiler The compiler to use with the instance.
     */
    withCompiler<TCompiled>(
        compiler: Compiler<TCompiled>,
    ): {
        query: (table: keyof T) => Query<T, ReturnTable<T, []>, TCompiled>;
        insert: (table: keyof T) => Write<T, TCompiled>;
        upsert: (table: keyof T) => Write<T, TCompiled>;
    } {
        return {
            query: (table: keyof T) =>
                new Query<T, ReturnTable<T, []>, TCompiled>({
                    compiler,
                }).from(table),
            insert: (table: keyof T) =>
                new Write<T, TCompiled>({
                    method: "insert",
                    compiler,
                }).into(table),
            upsert: (table: keyof T) =>
                new Write<T, TCompiled>({
                    method: "upsert",
                    compiler,
                }).into(table),
        };
    }

    /**
     * Returns a newly typed instance of `Store` with a specified compiler and executor.
     * This ensures correct type inference of both compiled and executed queries and insertions.
     * @param compiler The compiler to use with the instance.
     * @param executor The executor to use with the instance.
     */
    withExecutor<TCompiled, TWriteRes>(
        compiler: Compiler<TCompiled>,
        executor: Executor<TCompiled, TWriteRes>,
    ): {
        query: (table: keyof T) => Query<T, ReturnTable<T, []>, TCompiled>;
        insert: (table: keyof T) => Write<T, TCompiled, TWriteRes>;
        upsert: (table: keyof T) => Write<T, TCompiled, TWriteRes>;
    } {
        return {
            query: (table: keyof T) =>
                new Query<T, ReturnTable<T, []>, TCompiled>({
                    compiler,
                    executor,
                }).from(table),
            insert: (table: keyof T) =>
                new Write<T, TCompiled, TWriteRes>({
                    method: "insert",
                    compiler,
                    executor,
                }).into(table),
            upsert: (table: keyof T) =>
                new Write<T, TCompiled, TWriteRes>({
                    method: "upsert",
                    compiler,
                    executor,
                }).into(table),
        };
    }
}
