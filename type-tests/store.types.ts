import { Store } from "@msrass/query";

import { MockCompiler, MockExecutor } from "./mocks.ts";
import type { DB, UserRole } from "./db.types.ts";

import type { Equal, Expect } from "./testutils.types.ts";

const store = new Store<DB>().withExecutor(
    new MockCompiler(),
    new MockExecutor(),
);

type _test_query_infers_columns = Expect<
    Equal<
        Awaited<typeof _users_query>,
        { name: string; email: string }[]
    >
>;
const _users_query = store.query("users")
    .pick("users.name", "users.email")
    .execute();

type _test_query_infers_column_alias = Expect<
    Equal<
        Awaited<typeof _users_alias_query>,
        { username: string; email: string }[]
    >
>;
const _users_alias_query = store.query("users")
    .pick(["users.name", "username"], "users.email")
    .execute();

type _test_query_infers_join = Expect<
    Equal<
        Awaited<typeof _join_query>,
        {
            name: string;
            email: string;
            role: UserRole;
            organisation_name: string;
        }[]
    >
>;
const _join_query = store.query("users")
    .join("user_roles", "user_roles.user_id", "users.id")
    .join("organisations", "organisations.id", "user_roles.organisation_id")
    .pick("users.name", "users.email", "user_roles.role", [
        "organisations.name",
        "organisation_name",
    ]).execute();
