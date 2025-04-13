import type {
    Columns,
    Comparator,
    Database,
    Flat,
    Picks,
    ReturnTable,
    TableColumns,
} from "./types.ts";
import type { DatabaseProvider } from "../providers/types.ts";

export class Query<T extends Database, R = ReturnTable<T, []>> {
    private readonly provider: DatabaseProvider<T> | null = null;

    public table: (keyof T) | null = null;
    public picks: Picks<T> = [];
    public wheres: [Columns<T>, Flat<T>[Columns<T>], Comparator][] = [];
    public joins: [
        keyof T,
        TableColumns<T, keyof T>,
        Columns<T>,
        Comparator,
    ][] = [];

    constructor(provider?: DatabaseProvider<T>) {
        if (provider) this.provider = provider;
    }

    select<const K extends Picks<T>>(
        ...fields: K
    ): Query<T, ReturnTable<T, K>> {
        this.picks = fields;
        return this as Query<T, ReturnTable<T, K>>;
    }

    from(table: keyof T): Query<T, R> {
        this.table = table;
        return this;
    }

    where<K extends Columns<T>>(
        col: K,
        val: Flat<T>[K],
        comp: Comparator = "=",
    ): Query<T, R> {
        this.wheres.push([col, val, comp]);
        return this;
    }

    join<K extends keyof T>(
        table: K,
        first: TableColumns<T, K>,
        second: Columns<T>,
        comp: Comparator = "=",
    ): Query<T, R> {
        this.joins.push([table, first, second, comp]);
        return this;
    }

    async execute(): Promise<R[]> {
        if (!this.provider) throw new Error("No provider");
        return await this.provider.execute(this);
    }
}
