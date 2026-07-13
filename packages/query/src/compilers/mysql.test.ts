import { MySqlCompiler } from "./mysql.ts";
import { assertEquals } from "@std/assert";

import type { TestDatabase } from "../testdata/types.ts";
import { Store } from "../store.ts";

Deno.test("MySqlCompiler compiles Query class correctly", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    let query = store.query("users")
        .join("companies", "companies.id", "users.company_id")
        .pick("users.name", ["companies.name", "company_name"])
        .where("users.id", 1);

    let compiled = query.compile();

    let expected = `
SELECT \`users\`.\`name\`, \`companies\`.\`name\` AS company_name FROM \`users\`
JOIN \`companies\` ON \`companies\`.\`id\` = \`users\`.\`company_id\`
WHERE \`users\`.\`id\` = ?
`.trim();

    const [exSelect, exJoin, exWhere] = expected.split("\n");
    const [gotSelect, gotJoin, gotWhere] = compiled.sql.split("\n");

    assertEquals(gotSelect, exSelect, "compiles SELECT part of sql query");
    assertEquals(gotJoin, exJoin, "compiles JOIN part of sql query");
    assertEquals(gotWhere, exWhere, "compiles WHERE part of sql query");

    assertEquals(compiled.sql, expected, "compiles mysql query correctly");
    assertEquals(compiled.params, [1], "assembles params correctly");

    query = store.query("users")
        .join("companies", "companies.id", "users.company_id")
        .pick("users.name", ["companies.name", "company_name"])
        .order("users.company_id")
        .order("users.id", "desc");

    compiled = query.compile();

    expected = `
SELECT \`users\`.\`name\`, \`companies\`.\`name\` AS company_name FROM \`users\`
JOIN \`companies\` ON \`companies\`.\`id\` = \`users\`.\`company_id\`
ORDER BY \`users\`.\`company_id\` ASC, \`users\`.\`id\` DESC
`.trim();

    assertEquals(
        compiled.sql,
        expected,
        "compiles query with order statements",
    );
});

Deno.test("MySqlCompiler compiles Write class correctly", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const write = store.insert("messages").one({
        content: "some content",
        user_id: 1,
    });

    const compiled = write.compile();

    const expected = `
INSERT INTO \`messages\` (\`content\`, \`user_id\`)
VALUES (?, ?)
`.trim();

    const [exInto, exVals] = expected.split("\n");
    const [gotInto, gotVals] = compiled.sql.split("\n");

    assertEquals(gotInto, exInto, "compiles INSERT INTO part of write");
    assertEquals(gotVals, exVals, "compiles VALS placeholder part of write");

    assertEquals(compiled.sql, expected, "compiles mysql write correctly");
    assertEquals(
        compiled.params,
        ["some content", 1],
        "assembles params correctly",
    );
});

Deno.test("MySqlCompiler handles multiple objects", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const write = store.insert("messages").arr([{
        content: "first content",
        user_id: 1,
    }, {
        content: "second content",
        user_id: 2,
    }]);

    const compiled = write.compile();

    const expected = `
INSERT INTO \`messages\` (\`content\`, \`user_id\`)
VALUES
(?, ?),
(?, ?)
`.trim();

    assertEquals(compiled.sql, expected, "compiles mysql write correctly");
    assertEquals(
        compiled.params,
        ["first content", 1, "second content", 2],
        "assembles params correctly",
    );
});

Deno.test("MySqlCompiler compiles JSON fields on update", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const metadata = {
        data: {
            version: 1,
            kind: "test",
        },
    };

    const write = store.insert("metadata").one(metadata);

    const compiled = write.compile();

    const expected = `
INSERT INTO \`metadata\` (\`data\`)
VALUES (?)
`.trim();

    assertEquals(
        compiled.sql,
        expected,
        "compiles JSON field mysql write correctly",
    );
    assertEquals(
        compiled.params,
        [metadata.data],
    );
});

Deno.test("MySqlCompiler handles upserts", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const write = store.upsert("users").one({
        id: 1,
        name: "Jorge",
    });

    const compiled = write.compile();

    const expected = `
INSERT INTO \`users\` (\`id\`, \`name\`)
VALUES (?, ?)
ON DUPLICATE KEY UPDATE
id = VALUES(\`id\`),
name = VALUES(\`name\`)
`.trim();

    assertEquals(compiled.sql, expected, "compiles mysql write correctly");
    assertEquals(
        compiled.params,
        [1, "Jorge"],
        "assembles params correctly",
    );
});

Deno.test("MySqlCompiler handles updates single field", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const update = store.update("users").set({
        name: "Jorge",
    }).where(
        "users.id",
        1,
    );

    const compiled = update.compile();

    const expected = `
UPDATE \`users\`
SET \`users\`.\`name\` = ?
WHERE \`users\`.\`id\` = ?
`.trim();

    assertEquals(compiled.sql, expected, "compiled mysql write correctly");
    assertEquals(
        compiled.params,
        ["Jorge", 1],
        "assembles params correctly",
    );
});

Deno.test("MySqlCompiler handles updates multiple fields", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const update = store.update("users").set({
        name: "Jorge",
        email: "mail@example.com",
    }).where(
        "users.id",
        1,
    );

    const compiled = update.compile();

    const expected = `
UPDATE \`users\`
SET \`users\`.\`name\` = ?, \`users\`.\`email\` = ?
WHERE \`users\`.\`id\` = ?
`.trim();

    assertEquals(compiled.sql, expected, "compiled mysql update correctly");
    assertEquals(
        compiled.params,
        ["Jorge", "mail@example.com", 1],
        "assembles params correctly",
    );
});

Deno.test("MySqlCompiler handles delete", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const del = store.delete("users").where("users.id", 1);

    const compiled = del.compile();

    const expected = `
DELETE FROM \`users\`
WHERE \`users\`.\`id\` = ?
    `.trim();

    assertEquals(compiled.sql, expected, "compiled mysql delete correctly");
    assertEquals(
        compiled.params,
        [1],
        "assembles params correctly",
    );
});
