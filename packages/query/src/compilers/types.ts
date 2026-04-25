import type { QueryCompiler } from "../query.ts";
import type { WriteCompiler } from "../write.ts";

export interface Compiler<T extends unknown> {
    compileQuery: QueryCompiler<T>;
    compileWrite: WriteCompiler<T>;
}
