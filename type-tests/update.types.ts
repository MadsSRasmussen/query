import { mockStore } from "./testutils.ts";

/* update_accepts_field_types */
mockStore.update("users").set({
    id: 1,
    name: "foo",
});

/* update_accepts_partial_records */
mockStore.update("users").set({
    name: "foo",
});

/* update_enforces_field_types */
mockStore.update("users").set({
    name: "foo",

    // @ts-expect-error: field "id" is of type "number"
    id: "bar",
});

/* update_only_accepts_from_table */
mockStore.update("organisations").set({
    id: 0,
    name: "foo",

    // @ts-expect-error: field "email" does not exists on table "organisations"
    email: "mail@example.com",
});
