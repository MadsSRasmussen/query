import { mockStore } from "./testutils.ts";
import type { UserRole } from "./db.types.ts";

import type { Equal, Expect } from "./testutils.types.ts";

type _test_query_infers_columns = Expect<
    Equal<
        Awaited<typeof _users_query>,
        { name: string; email: string; created_at: Date }[]
    >
>;
const _users_query = mockStore.query("users")
    .pick("users.name", "users.email", "users.created_at")
    .execute();

type _test_query_infers_column_alias = Expect<
    Equal<
        Awaited<typeof _users_alias_query>,
        { username: string; email: string }[]
    >
>;
const _users_alias_query = mockStore.query("users")
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
const _join_query = mockStore.query("users")
    .join("user_roles", "user_roles.user_id", "users.id")
    .join("organisations", "organisations.id", "user_roles.organisation_id")
    .pick("users.name", "users.email", "user_roles.role", [
        "organisations.name",
        "organisation_name",
    ]).execute();

/* query_enforces_existning_table */
// @ts-expect-error: table "_not_a_table" does not exist
const _ = mockStore.query("_not_a_table");

/* query_enforeces_type_in_where */
mockStore.query("users").where("users.name", "foo");

// @ts-expect-error: "users.name" is of type string
mockStore.query("users").where("users.name", 123);

/* query_enforces_col_from_selected_on_where */
mockStore.query("users")
    .join("organisations", "organisations.id", "users.id")
    .where("organisations.name", "foo");

mockStore.query("users")
    // @ts-expect-error: table "organisations" not joined
    .where("organisations.name", "foo");

/* query_envorces_col_from_selected_on_order */
mockStore.query("users")
    .join("organisations", "organisations.id", "users.id")
    .order("organisations.name");

mockStore.query("users")
    // @ts-expect-error: table "organisations" not joined
    .order("organisations.name");

/* query_enforces_picks_from_selected */
mockStore.query("users")
    .join("user_roles", "user_roles.user_id", "users.id")
    .pick("user_roles.organisation_id");

mockStore.query("users")
    // @ts-expect-error: table "organisations" not joined
    .pick("user_roles.organisation_id");
