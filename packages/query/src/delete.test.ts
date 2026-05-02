import { Delete } from "./delete.ts";
import { assert, assertEquals, assertThrows } from "@std/assert";
import { NoClauseError } from "./errors.ts";

import type { TestDatabase } from "./testdata/types.ts";

Deno.test("Delete class builds correctly", () => {
    const del = (new Delete<TestDatabase>())
        .from("users")
        .where("users.id", 1);

    assertEquals(del.table, "users");
    assertEquals(del.wheres, [
        ["users.id", 1, "="],
    ]);
});

Deno.test("Delete class throws NoClauseError correctly", () => {
    let del = (new Delete<TestDatabase>()).from("users");

    assertThrows(
        () => del.compile(),
        NoClauseError,
    );

    del = del.explicitNoClause();

    let error: Error = new NoClauseError("");
    try {
        del.compile();
    } catch (err) {
        error = err as Error;
    }

    assert(!(error instanceof NoClauseError));
});
