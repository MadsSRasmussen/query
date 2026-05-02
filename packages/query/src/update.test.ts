import { Update } from "./update.ts";
import { assertEquals, assertThrows } from "@std/assert";

import type { TestDatabase } from "./testdata/types.ts";
import { NoClauseError } from "./errors.ts";
import { assert } from "node:console";

Deno.test("Update class constructs update", () => {
    const update = (new Update<TestDatabase>())
        .into("users")
        .set({ name: "John" })
        .where("users.id", 1);

    assertEquals(update.table, "users");
    assertEquals(update.data, { name: "John" });
    assertEquals(update.wheres, [
        ["users.id", 1, "="],
    ]);
});

Deno.test("Update class throws NoClauseError correctly", () => {
    let update = (new Update<TestDatabase>())
        .into("users")
        .set({ name: "John" });

    assertThrows(
        () => update.compile(),
        NoClauseError,
    );

    update = update.explicitNoClause();

    let error: Error = new NoClauseError("");
    try {
        update.compile();
    } catch (err) {
        error = err as Error;
    }

    assert(!(error instanceof NoClauseError));
});
