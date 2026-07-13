import mysql2 from "mysql2/promise";
import { MySql2Executor } from "@msrass/query-mysql2";
import { DB, DefaultDate } from "./testdata/database.ts";
import { Store } from "@msrass/query";
import { MySqlCompiler } from "@msrass/query/mysql";
import { assert, assertEquals, assertRejects } from "@std/assert";

Deno.test({
    name: "integration/mysql2",
    async fn(t) {
        const pool = mysql2.createPool({
            host: "localhost",
            user: "root",
            password: "root",
            database: "test",
            timezone: "Z",
        });

        const compiler = new MySqlCompiler();
        const executor = new MySql2Executor(pool);
        const store = new Store<DB>().withExecutor(compiler, executor);

        await t.step("query all users", async () => {
            const results = await store
                .query("users")
                .pick("users.id", "users.name", "users.created_at")
                .execute();

            assertEquals(results[0], {
                id: 1,
                name: "root",
                created_at: DefaultDate,
            });

            const { created_at, ...rest } = results[1];
            assertEquals(rest, {
                id: 2,
                name: "default",
            });
            assert(created_at instanceof Date);
            assert(!isNaN(created_at.getTime()));
        });

        await t.step(
            "query all posts with multiple order statements",
            async () => {
                const results = await store
                    .query("posts")
                    .join("users", "users.id", "posts.user_id")
                    .pick(["users.id", "user_id"], ["posts.id", "post_id"])
                    .order("users.id")
                    .order("posts.id", "desc")
                    .execute();

                assertEquals(results.slice(0, 4), [
                    { post_id: 2, user_id: 1 },
                    { post_id: 1, user_id: 1 },
                    { post_id: 4, user_id: 2 },
                    { post_id: 3, user_id: 2 },
                ]);
            },
        );

        await t.step("query posts for user with id 1", async () => {
            const results = await store
                .query("posts")
                .join("users", "users.id", "posts.user_id")
                .pick(
                    ["users.id", "user_id"],
                    "users.name",
                    "posts.content",
                    "posts.id",
                    "posts.created_at",
                )
                .where("users.id", 1)
                .execute();

            assertEquals(results[0], {
                user_id: 1,
                name: "root",
                content: "content:root:1",
                id: 1,
                created_at: DefaultDate,
            });
            assertEquals(results[1], {
                user_id: 1,
                name: "root",
                content: "content:root:2",
                id: 2,
                created_at: DefaultDate,
            });
        });

        await t.step("insert single post", async () => {
            const now = new Date(Math.floor(Date.now() / 1000) * 1000); // MySQL TIMERSTAMP truncates to s

            const result = await store.insert("posts").one({
                content: "content:1",
                user_id: 1,
                created_at: now,
            }).execute();

            assertEquals(result.id, 5);

            const [post] = await store.query("posts")
                .pick("posts.content", "posts.user_id", "posts.created_at")
                .where("posts.id", result.id as number)
                .execute();

            assertEquals(post.content, "content:1");
            assertEquals(post.user_id, 1);
            assertEquals(post.created_at, now);
        });

        await t.step("insert multiple posts", async () => {
            const result = await store.insert("posts").arr([{
                id: 98,
                content: "content:1",
                user_id: 1,
            }, {
                id: 99,
                content: "content:2",
                user_id: 2,
            }]).execute();

            assertEquals(result.id, 99);

            const [first, last] = await store.query("posts")
                .pick("posts.id", "posts.content", "posts.user_id")
                .where("posts.id", 98, ">=")
                .execute();

            assertEquals(first, { id: 98, content: "content:1", user_id: 1 });
            assertEquals(last, { id: 99, content: "content:2", user_id: 2 });
        });

        let pid: number;
        await t.step("upsert post", async () => {
            const firstRes = await store.upsert("posts").one({
                content: "content:1",
                user_id: 1,
            }).execute();

            pid = firstRes.id as number;

            const lastRes = await store.upsert("posts").one({
                id: firstRes.id as number,
                content: "content:1:updated",
                user_id: 2,
            }).execute();

            assertEquals(lastRes.id, firstRes.id);

            const [post] = await store.query("posts")
                .pick("posts.id", "posts.content", "posts.user_id")
                .where("posts.id", firstRes.id as number)
                .execute();

            assertEquals(post.content, "content:1:updated");
            assertEquals(post.user_id, 2);
        });

        await t.step("update post", async () => {
            const res = await store.update("posts")
                .set({ content: "updated:unique" })
                .where("posts.id", pid)
                .execute();

            assertEquals(res.affected, 1);

            const [post] = await store.query("posts")
                .pick("posts.content")
                .where("posts.id", pid)
                .execute();

            assertEquals(post.content, "updated:unique");

            // Ensure records with id != pid are untouched
            const posts = await store.query("posts")
                .pick("posts.id", "posts.content")
                .execute();

            const none = posts.filter((post) => post.id != pid).filter((post) =>
                post.content == "updated:unique"
            );
            assertEquals(none.length, 0);
        });

        await t.step("delete post", async () => {
            const res = await store.delete("posts")
                .where("posts.id", pid)
                .execute();

            assertEquals(res.affected, 1);
        });

        await t.step("handles json fields", async () => {
            const data = {
                version: 1,
                kind: "test",
            };

            const res = await store.insert("metadata")
                .one({ user_id: 1, data: data })
                .execute();

            const [metadata] = await store.query("metadata")
                .pick("metadata.id", "metadata.user_id", "metadata.data")
                .where("metadata.id", res.id as number)
                .execute();

            assertEquals(metadata, {
                id: res.id as number,
                data: data,
                user_id: 1,
            });
        });

        await t.step("transactions success", async () => {
            let trans = await store.query("transactions")
                .pick("transactions.data")
                .execute();
            assertEquals(trans.length, 0);

            await store.transaction(async (tx) => {
                await tx.insert("transactions").one({ data: "first" })
                    .execute();

                await tx.insert("transactions").one({ data: "second" })
                    .execute();

                await tx.insert("transactions").one({ data: "third" })
                    .execute();
            });

            trans = await store.query("transactions")
                .pick("transactions.data")
                .execute();
            assertEquals(trans.map((t) => t.data), [
                "first",
                "second",
                "third",
            ]);

            await store.delete("transactions").explicitNoClause()
                .execute();
        });

        await t.step("transaction rolls back on error", async () => {
            let trans = await store.query("transactions")
                .pick("transactions.data")
                .execute();
            assertEquals(trans.length, 0, "initial state contains 0 entries");

            await assertRejects(() =>
                store.transaction(async (tx) => {
                    await tx.insert("transactions").one({ data: "first" })
                        .execute();

                    await tx.insert("transactions").one({ data: "second" })
                        .execute();

                    await tx.insert("transactions").one({ data: "third" })
                        .execute();

                    await tx.insert("transactions").one({ _invalid: "oops" })
                        .execute();
                })
            );

            trans = await store.query("transactions")
                .pick("transactions.data")
                .execute();
            assertEquals(trans.length, 0, "rollback contains 0 entries");
            await store.delete("transactions").explicitNoClause()
                .execute();
        });

        await pool.end();
    },
    sanitizeResources: false,
    sanitizeOps: false,
});
