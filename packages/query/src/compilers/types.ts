import type { QueryCompiler } from "../query.ts";

export interface Compiler<T extends unknown> {
    compileQuery: QueryCompiler<T>;
}
