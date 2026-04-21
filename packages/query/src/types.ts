export type { Query } from "./query.ts";

/**
 * Supported comparisson operations for clauses.
 */
export type Comparator = "=" | "<" | ">" | ">=" | "<=" | "!=";

/**
 * Primitive values that can be stored in a database column.
 */
export type FieldData = string | number | boolean | null;

/**
 * Represents a single database table.
 * Each key is a column name, and each value is the type of the column.
 */
export type BaseTable = { [index: string]: FieldData };

/**
 * Represents a full database schema.
 * Each key is a table name, and each value is a table definition.
 *
 * @example
 * ```ts
 * type DB = {
 *     users: { id: number, name: string };
 *     posts: { id: number, content: string, user_id: number };
 * }
 * ```
 */
export type Database = { [index: string]: BaseTable };

/**
 * All the selectable columns in a database, in `'table.column'` format.
 *
 * @example
 * ```ts
 * type C = Columns<DB>; // 'users.id' | 'users.name' | 'posts.id' | ...
 * ```
 */
export type Columns<T extends Database> = {
    [K in keyof T]: K extends string
        ? (keyof T[K] extends string ? `${K}.${keyof T[K]}` : never)
        : never;
}[keyof T];

/**
 * Defines which columns to select in a query.
 */
export type Picks<T extends Database> = (Columns<T> | [Columns<T>, string])[];

/**
 * All columns in a specific table in `'table.column'` format.
 */
export type TableColumns<T extends Database, K extends keyof T> = {
    [C in keyof T[K]]: K extends string
        ? (C extends string ? `${K}.${C}` : never)
        : never;
}[keyof T[K]];

export type Flat<T extends Database> = {
    [K in keyof T]: T[
        K extends `${infer K}.${infer _}` ? K : never
    ][
        K extends `${infer _}.${infer C}` ? C : never
    ];
};

export type ReturnTable<T extends Database, K extends Picks<T>> = {
    [
        C in K[number] as C extends `${infer _}.${infer Column}` ? Column
            : C extends [infer _, infer Alias]
                ? Alias extends string ? Alias : never
            : never
    ]: C extends `${infer Table}.${infer Column}` ? T[Table][Column]
        : C extends [infer Original, infer _]
            ? Original extends `${infer Table}.${infer Column}`
                ? T[Table][Column]
            : never
        : never;
};
