import { Query } from "./query.ts";
import { assertEquals, assertRejects } from "@std/assert";

import type { TestDatabase } from "../testdata/types.ts";

Deno.test("query class constructs correctly", () => {
    const query = (new Query<TestDatabase>())
        .from("users")
        .select("users.id", "users.name", "messages.content")
        .join("messages", "messages.user_id", "users.id")
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

Deno.test("query class overwrites and appends appropriately", () => {
    const query = (new Query<TestDatabase>())
        .from("messages")
        .select("messages.id", "messages.content")
        .join("messages", "messages.user_id", "users.id")
        .where("messages.id", 255, "<")
        .from("users")
        .select("users.name", "companies.name", "messages.content")
        .join("companies", "companies.id", "users.company_id")
        .where("companies.id", 1);

    assertEquals(query.table, "users", "overwrites base table");
    assertEquals(query.picks, [
        "users.name",
        "companies.name",
        "messages.content",
    ], "overwrites picks");
    assertEquals(query.joins, [
        ["messages", "messages.user_id", "users.id", "="],
        ["companies", "companies.id", "users.company_id", "="],
    ], "appends joins");
    assertEquals(query.wheres, [
        ["messages.id", 255, "<"],
        ["companies.id", 1, "="],
    ], "appends wheres");
});

Deno.test("query class errors on execute if no provider is provided", () => {
    const query = new Query<TestDatabase>();

    assertRejects(query.execute);
});
