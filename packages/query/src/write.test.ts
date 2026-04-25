import { Write } from "./write.ts";
import { assertEquals } from "@std/assert";

import type { TestDatabase } from "./testdata/types.ts";

Deno.test("Write class constructs single write", () => {
    const write = (new Write<TestDatabase>())
        .into("users")
        .one({ id: 1, name: "Foo" });

    assertEquals(write.table, "users");
    assertEquals(write.data, { id: 1, name: "Foo" });
    assertEquals(write.method, "insert");
});

Deno.test("Write class constructrs array write", () => {
    const write = (new Write<TestDatabase>())
        .into("users")
        .arr([{
            id: 1,
            name: "Foo",
        }, {
            id: 2,
            name: "Bar",
        }]);

    assertEquals(write.table, "users");
    assertEquals(write.data, [
        { id: 1, name: "Foo" },
        { id: 2, name: "Bar" },
    ]);
});
