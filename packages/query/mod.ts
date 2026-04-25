/**
 * This module contains the basic structures of the query package.
 * It does not provide the ability to execute any compiled MySQL. For this, execution adapters must be used.
 *
 * ```ts
 * import { Store } from "@msrass/query";
 * import { MySqlCompiler } from "@msrass/query/mysql";
 *
 * type PostsStore = {
 *     users: { id: number, name: string };
 *     posts: { id: number, content: string, user_id: number };
 * }
 *
 * const posts = new Store<PostsStore>().withCompiler(new MySqlCompiler());
 *
 * const query = posts.query('posts')
 *     .join('users', 'users.id', 'posts.user_id')
 *     .pick(['users.id', 'user_id'], 'users.name', 'posts.content', 'posts.id')
 *     .where('users.id', 1);
 * ```
 *
 * @module
 */

/* Regular exports */

export { Store } from "./src/store.ts";
export { Query } from "./src/query.ts";

/* Type exports */

export type {
    BaseTable,
    Comparator,
    Database,
    FieldData,
} from "./src/types.ts";

export type { CompiledQuery, QueryExecutor } from "./src/query.ts";
export type { WriteExecutor } from "./src/write.ts";

export type { Executor } from "./src/executor.ts";
export type { Compiler } from "./src/compilers/types.ts";
