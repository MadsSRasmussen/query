import type { QueryCompiler } from "../query.ts";
import type { WriteCompiler } from "../write.ts";
import type { UpdateCompiler } from "../update.ts";
import type { DeleteCompiler } from "../delete.ts";

export interface Compiler<T extends unknown> {
    compileQuery: QueryCompiler<T>;
    compileWrite: WriteCompiler<T>;
    compileUpdate: UpdateCompiler<T>;
    compileDelete: DeleteCompiler<T>;
}
