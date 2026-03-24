import type { Database, ReturnTable } from "./types.ts";
import type { Compiler } from "./compilers/types.ts";
import { Query } from "./query.ts";
import type { Executor } from "@msrass/query";

export class Store<T extends Database, TCompiled = unknown> {
    query(table: keyof T): Query<T, ReturnTable<T, []>, TCompiled> {
        const query = new Query<T, ReturnTable<T, []>, TCompiled>();
        return query.from(table);
    }

    withCompiler<TCompiled>(compiler: Compiler<TCompiled>) {
        return {
            query: (table: keyof T) =>
                new Query<T, ReturnTable<T, []>, TCompiled>({
                    compiler,
                }).from(table),
        };
    }

    withExecutor<TCompiled>(
        compiler: Compiler<TCompiled>,
        executor: Executor<TCompiled>,
    ) {
        return {
            query: (table: keyof T) =>
                new Query<T, ReturnTable<T, []>, TCompiled>({
                    compiler,
                    executor,
                }).from(table),
        };
    }
}
