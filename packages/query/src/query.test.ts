import { Query } from "./query.ts";
import { assertEquals } from "@std/assert";

import type { TestDatabase } from "./testdata/types.ts";

Deno.test("query class constructs correctly", () => {
    const query = (new Query<TestDatabase>())
        .from("users")
        .join("messages", "messages.user_id", "users.id")
        .pick("users.id", "users.name", "messages.content")
        .where("messages.id", 100, "<");

    assertEquals(query.table, "users");
    assertEquals(query.picks, ["users.id", "users.name", "messages.content"]);
    assertEquals(query.joins, [[
        "messages",
        "messages.user_id",
        "users.id",
        "=",
    ]]);
    assertEquals(query.wheres, [["messages.id", 100, "<"]]);
});
