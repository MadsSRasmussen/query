export type Comparator = "=" | "<" | ">" | ">=" | "<=" | "!=";
export type FieldData = string | number | boolean | null;
export type BaseTable = { [index: string]: FieldData };
export type Database = { [index: string]: BaseTable };

export type Columns<T extends Database> = {
    [K in keyof T]: K extends string
        ? (keyof T[K] extends string ? `${K}.${keyof T[K]}` : never)
        : never;
}[keyof T];

export type Picks<T extends Database> = (Columns<T> | [Columns<T>, string])[];

export type Flat<T extends Database> = {
    [K in keyof T]: T[
        K extends `${infer K}.${infer _}` ? K : never
    ][
        K extends `${infer _}.${infer C}` ? C : never
    ];
};

export type TableColumns<T extends Database, K extends keyof T> = {
    [C in keyof T[K]]: K extends string
        ? (C extends string ? `${K}.${C}` : never)
        : never;
}[keyof T[K]];

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
