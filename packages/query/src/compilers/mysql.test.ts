import { MySqlCompiler } from "./mysql.ts";
import { assertEquals } from "@std/assert";

import type { TestDatabase } from "../testdata/types.ts";
import { Store } from "../store.ts";

Deno.test("MySQLCompiler compiles Query class correctly", () => {
    const store = new Store<TestDatabase>().withCompiler(new MySqlCompiler());

    const query = store.query("users")
        .join("companies", "companies.id", "users.company_id")
        .pick("users.name", ["companies.name", "company_name"])
        .where("users.id", 1);

    const compiled = query.compile();

    const expected = `
SELECT \`users\`.\`name\`, \`companies\`.\`name\` AS company_name FROM \`users\`
JOIN \`companies\` ON \`companies\`.\`id\` = \`users\`.\`company_id\`
WHERE \`users\`.\`id\` = ?
`.trim();

    const [exSelect, exJoin, exWhere] = expected.split("\n");
    const [gotSelect, gotJoin, gotWhere] = compiled.query.split("\n");

    assertEquals(gotSelect, exSelect, "compiles SELECT part of sql query");
    assertEquals(gotJoin, exJoin, "compiles JOIN part of sql query");
    assertEquals(gotWhere, exWhere, "compiles WHERE part of sql query");

    assertEquals(compiled.query, expected, "compiles mysql query correctly");
    assertEquals(compiled.params, [1], "assembles params correctly");
});
