import type { QueryCompiler } from "../query.ts";
import type { WriteCompiler } from "../write.ts";
import type { UpdateCompiler } from "../update.ts";

export interface Compiler<T extends unknown> {
    compileQuery: QueryCompiler<T>;
    compileWrite: WriteCompiler<T>;
    compileUpdate: UpdateCompiler<T>;
}
