import { Compiler, Executor } from "@msrass/query";
import type {
    CompiledQuery,
    DeleteCompiler,
    DeleteExecutor,
    QueryCompiler,
    QueryExecutor,
    UpdateCompiler,
    UpdateExecutor,
    WriteCompiler,
    WriteExecutor,
} from "@msrass/query";

type TCompiled = string;

export class MockCompiler implements Compiler<TCompiled> {
    public compileQuery: QueryCompiler<TCompiled> = ((_) => {
        return "mock";
    });

    public compileWrite: WriteCompiler<TCompiled> = ((_) => {
        return "mock";
    });

    public compileUpdate: UpdateCompiler<TCompiled> = ((_) => {
        return "mock";
    });

    public compileDelete: DeleteCompiler<TCompiled> = ((_) => {
        return "mock";
    });
}

type TExec = string;
export class MockExecutor implements Executor<TCompiled, TExec> {
    public executeQuery: QueryExecutor<TCompiled> = (compiled) => {
        return Promise.resolve(
            [] as unknown as typeof compiled extends
                CompiledQuery<TCompiled, infer R> ? R[]
                : never,
        );
    };

    public executeWrite: WriteExecutor<TCompiled, TExec> = (_) => {
        return Promise.resolve("mock");
    };

    public executeUpdate: UpdateExecutor<TCompiled, TExec> = (_) => {
        return Promise.resolve("mock");
    };

    public executeDelete: DeleteExecutor<TCompiled, TExec> = (_) => {
        return Promise.resolve("mock");
    };
}
