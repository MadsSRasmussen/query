import type { Database, ReturnTable } from "./types.ts";
import type { Compiler } from "./compilers/types.ts";

import { Query } from "./query.ts";
import { Write } from "./write.ts";
import { Update } from "./update.ts";
import { Delete } from "./delete.ts";

import type { Executor, TransactionalExecutor } from "./executor.ts";

type StoreApi<T extends Database, TCompiled, TExecRes> = {
    query<K extends keyof T>(
        table: K,
    ): Query<T, ReturnTable<T, []>, TCompiled, K>;
    insert<TTB extends keyof T>(table: TTB): Write<T, TCompiled, TExecRes, TTB>;
    upsert<TTB extends keyof T>(table: TTB): Write<T, TCompiled, TExecRes, TTB>;
    update<TTB extends keyof T>(
        table: TTB,
    ): Update<T, TCompiled, TExecRes, TTB>;
    delete<TTB extends keyof T>(
        table: TTB,
    ): Delete<T, TCompiled, TExecRes, TTB>;
};

function buildApi<T extends Database, TCompiled, TExecRes>(
    compiler: Compiler<TCompiled>,
    executor?: Executor<TCompiled, TExecRes>,
): StoreApi<T, TCompiled, TExecRes> {
    return {
        query: <K extends keyof T>(table: K) =>
            new Query<T, ReturnTable<T, []>, TCompiled, K>({
                compiler,
                executor,
            }).from(table),
        insert: <TTB extends keyof T>(table: TTB) =>
            new Write<T, TCompiled, TExecRes, TTB>({
                method: "insert",
                compiler,
                executor,
            }).into(table),
        upsert: <TTB extends keyof T>(table: TTB) =>
            new Write<T, TCompiled, TExecRes, TTB>({
                method: "upsert",
                compiler,
                executor,
            }).into(table),
        update: <TTB extends keyof T>(table: TTB) =>
            new Update<T, TCompiled, TExecRes, TTB>({
                compiler,
                executor,
            }).into(table),
        delete: <TTB extends keyof T>(table: TTB) =>
            new Delete<T, TCompiled, TExecRes, TTB>({
                compiler,
                executor,
            }).from(table),
    };
}

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
    ): StoreApi<T, TCompiled, unknown> {
        return buildApi<T, TCompiled, unknown>(compiler);
    }

    /**
     * Returns a newly typed instance of `Store` with a specified compiler and executor.
     * This ensures correct type inference of both compiled and executed queries and insertions.
     * @param compiler The compiler to use with the instance.
     * @param executor The executor to use with the instance.
     */
    withExecutor<TCompiled, TExecRes>(
        compiler: Compiler<TCompiled>,
        executor: TransactionalExecutor<TCompiled, TExecRes>,
    ): StoreApi<T, TCompiled, TExecRes> & {
        transaction(
            fn: (tx: StoreApi<T, TCompiled, TExecRes>) => Promise<void>,
        ): Promise<void>;
    };

    /**
     * Returns a newly typed instance of `Store` with a specified compiler and transactional executor.
     * This ensures correct type inference of both compiled and executed queries and insertions.
     * @param compiler The compiler to use with the instance.
     * @param executor The executor to use with the instance.
     */
    withExecutor<TCompiled, TExecRes>(
        compiler: Compiler<TCompiled>,
        executor: Executor<TCompiled, TExecRes>,
    ): StoreApi<T, TCompiled, TExecRes>;

    withExecutor<TCompiled, TExecRes>(
        compiler: Compiler<TCompiled>,
        executor:
            | Executor<TCompiled, TExecRes>
            | TransactionalExecutor<TCompiled, TExecRes>,
    ) {
        const api = buildApi<T, TCompiled, TExecRes>(
            compiler,
            executor,
        );

        if (!("transaction" in executor)) {
            return api;
        }

        return {
            ...api,
            transaction: async <TReturn>(
                fn: (tx: StoreApi<T, TCompiled, TExecRes>) => Promise<TReturn>,
            ) => {
                const txConn = await executor.transaction();

                await txConn.begin();

                try {
                    const res = await fn(
                        buildApi<T, TCompiled, TExecRes>(compiler, txConn),
                    );
                    await txConn.commit();
                    return res;
                } catch (err) {
                    await txConn.rollback();
                    throw err;
                }
            },
        };
    }
}
