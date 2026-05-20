/**
 * ```ts
 * import { Store } from "@msrass/query";
 *
 * import { MySqlCompiler } from "@msrass/query/mysql";
 * import { MySql2Executor } from "@msrass/query-mysql2";
 *
 * import mysql2 from "mysql2/promise";
 *
 * const pool = mysql2.createPool({
 *     host: 'localhost',
 *     user: 'root',
 *     password: 'root',
 *     database: 'test',
 * });
 *
 * const compiler = new MySqlCompiler();
 * const executor = new MySql2Executor(pool);
 *
 * type Database = {
 *     users: { id: number; name: string };
 *     posts: { id: number; content: string; user_id: number };
 * };
 *
 * const store = new Store<Database>().withExecutor(compiler, executor);
 *
 * // The query can be now be crafted.
 * const query = store.query("posts")
 *     .join('users', 'users.id', 'posts.user_id')
 *     .pick(['users.id', 'user_id'], 'users.name', 'posts.content', 'posts.id')
 *     .where('users.id', 1);
 *
 * // And executed.
 * const posts = await query.execute();
 *
 * console.log(posts);
 * ```
 *
 * @module
 */

export { MySql2Executor } from "./executor.ts";
