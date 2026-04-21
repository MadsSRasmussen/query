import type { Database, ReturnTable } from "./types.ts";
import type { Compiler } from "./compilers/types.ts";
import { Query } from "./query.ts";
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
export class Store<T extends Database, TCompiled = unknown> {
    /** Create a new `Store` instance. */
    constructor() {}

    /**
     * Create a `Query` instance querying from the base table specified.
     * @param table The name of the base table to query from.
     */
    query(table: keyof T): Query<T, ReturnTable<T, []>, TCompiled> {
        const query = new Query<T, ReturnTable<T, []>, TCompiled>();
        return query.from(table);
    }

    /**
     * Return a newly typed instance of `Store` with a specified compiler.
     * This ensures correct type inference of compiled queries.
     * @param compiler The compiler to use with the instance.
     */
    withCompiler<TCompiled>(
        compiler: Compiler<TCompiled>,
    ): { query: (table: keyof T) => Query<T, ReturnTable<T, []>, TCompiled> } {
        return {
            query: (table: keyof T) =>
                new Query<T, ReturnTable<T, []>, TCompiled>({
                    compiler,
                }).from(table),
        };
    }

    /**
     * Returns a newly typed instance of `Store` with a specified compiler and executor.
     * This ensures correct type inference of both compiled and executed queries.
     * @param compiler The compiler to use with the instance.
     * @param executor The executor to use with the instance.
     */
    withExecutor<TCompiled>(
        compiler: Compiler<TCompiled>,
        executor: Executor<TCompiled>,
    ): { query: (table: keyof T) => Query<T, ReturnTable<T, []>, TCompiled> } {
        return {
            query: (table: keyof T) =>
                new Query<T, ReturnTable<T, []>, TCompiled>({
                    compiler,
                    executor,
                }).from(table),
        };
    }
}
