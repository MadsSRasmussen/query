import { mockStore } from "./testutils.ts";

/* insert_accepts_field_types */
mockStore.insert("users").one({
    id: 1,
    name: "foo",
    email: "mail@example.com",
});

/* insert_accepts_partial_records */
mockStore.insert("users").one({
    name: "foo",
});

/* insert_enforces_field_types */
mockStore.insert("users").one({
    name: "foo",

    // @ts-expect-error: field "id" is of type "number"
    id: "bar",
});

/* insert_only_accepts_from_table */
mockStore.insert("organisations").one({
    id: 0,
    name: "foo",

    // @ts-expect-error: field "email" does not exists on table "organisations"
    email: "mail@example.com",
});

/* insert_identical_in_arr */
mockStore.insert("users").arr([{
    name: "foo",
    email: "mail@example.com",
}, {
    name: "bar",
    email: "mail@example.com",
}]);

/* inser_enforces_identical_in_arr */
// @ts-expect-error: field "email" only exists in one element
mockStore.insert("users").arr(data);

const data = [{
    name: "foo",
}, {
    name: "bar",
    email: "mail@example.com",
}];
