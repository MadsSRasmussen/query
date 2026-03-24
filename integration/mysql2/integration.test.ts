import mysql2 from "mysql2/promise";
import { MySql2Executor } from "@msrass/query-mysql2";
import { DB } from "./testdata/database.ts";
import { Store } from "@msrass/query";
import { MySqlCompiler } from "@msrass/query/mysql";
import { assertEquals } from "@std/assert";

Deno.test({
    name: "integration",
    async fn(t) {
        const pool = mysql2.createPool({
            host: "localhost",
            user: "root",
            password: "root",
            database: "test",
        });

        const compiler = new MySqlCompiler();
        const executor = new MySql2Executor(pool);
        const store = new Store<DB>().withExecutor(compiler, executor);

        await t.step("query all users", async () => {
            const results = await store
                .query("users")
                .pick("users.id", "users.name")
                .execute();

            assertEquals(results[0], { id: 1, name: "root" });
            assertEquals(results[1], { id: 2, name: "default" });
        });

        await t.step("query posts for user with id 1", async () => {
            const results = await store
                .query("posts")
                .join("users", "users.id", "posts.user_id")
                .pick(["users.id", "user_id"], "users.name", "posts.content", "posts.id")
                .where("users.id", 1)
                .execute();

            assertEquals(results[0], { user_id: 1, name: "root", content: "content:root:1", id: 1 });
            assertEquals(results[1], { user_id: 1, name: "root", content: "content:root:2", id: 2 });
        });

        await pool.end();
    },
    sanitizeResources: false,
    sanitizeOps: false,
});
