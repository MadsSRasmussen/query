import { Update } from "./update.ts";
import { assertEquals } from "@std/assert";

import type { TestDatabase } from "./testdata/types.ts";

Deno.test("Update class constructs update", () => {
    const update = (new Update<TestDatabase>())
        .into("users")
        .set({ name: "Mads" })
        .where("users.id", 1);

    assertEquals(update.table, "users");
    assertEquals(update.data, { name: "Mads" });
    assertEquals(update.wheres, [
        ["users.id", 1, "="],
    ]);
});
