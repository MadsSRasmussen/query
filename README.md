# query

query is a typesafe query builder with adapters for database connectors.

_The library is still early in development – api's may contain breaking changes
in all updates until v1.0.0 is reached._

## Table of Contents

- [Description](#description)
- [Usage](#usage)
- [Contributing](#contributing)

## Description

This library helps to create typesafe querys in an sql-like style. It relies on
a centrally defined Database type, mathcing the schema of a given database, for
type safety.

## Usage

The library can be installed via deno:

```bash
deno add jsr:@msrass/query
```

This adds the core query package as a dependency to a deno project. And enables
users to construct queries.

### Typesafe queries

```ts
import { Store } from "@msrass/query";

type DB = {
    users: { id: number; name: string };
    posts: { id: number; content: string; user_id: number };
};

const store = new Store<DB>();

const query = store.query("posts") // Typesafe query
    .join("users", "users.id", "posts.user_id")
    .pick(["users.id", "user_id"], "users.name", "posts.content", "posts.id")
    .where("users.id", 1);
```

### Database connection

A `Store` instance needs a reference to a `Compiler` and an `Executor` to enable
execution of reads and writes against a database.

To add a specific instance of an executor to the project, a seperate adapter
package must be installed. The following is an example install command
installing the core library and a mysql2 adapter:

```bash
deno add jsr:@msrass/query jsr:@msrass/query-mysql2 npm:mysql2
```

A `Compiler` and an `Executor` must be imported and parssed to a `.withExecutor`
method on the `Store` class to enable the `.execute()` method on a command:

```ts
import { Store } from "@msrass/query";

import { MySqlCompiler } from "@msrass/query/mysql";
import { MySql2Executor } from "@msrass/query-mysql2";

import mysql2 from "mysql2/promise";

type DB = {
    users: { id: number; name: string };
    posts: { id: number; content: string; user_id: number };
};

const compiler = new MySqlCompiler();

const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "test",
});

const executor = new MySql2Executor(pool);

const store = new Store<DB>().withExecutor(compiler, executor);

// Insert a post
const write = store.insert("posts").one({
    id: 1,
    name: "John",
});

const res = await write.execute();

// Query posts
const query = store.query("posts")
    .join("users", "users.id", "posts.user_id")
    .pick(["users.id", "user_id"], "users.name", "posts.content", "posts.id")
    .where("users.id", res.id);

// Now the query can be executed with:
const posts = await query.execute();

console.log(posts);
```

### Transactions

If a `Store.withCompiler` method is called with an instance of a
`TransactionalExecutor`, transactions can be performed via the following:

```ts
// ...continuation of previous example

await store.transaction((tx) => {
    const res = await tx.insert("users") // tx is a typed api
        .one({ name: "John Smith" })
        .execute();

    await tx.insert("posts").one({
        user_id: res.id as number,
        content: "foo, bar and baz!",
    }).execute();
});
```

Please note that **the transaction rollback mechanism relies on the callback
function passed to `Store.transaction` throwing an error.**

### Adapters

The following is a list of available compilers and executors.

#### Compilers

| Dialect | Compiler                                              |
| :------ | :---------------------------------------------------- |
| MySQL   | `import { MySqlCompiler } from "@msrass/query/mysql"` |

#### Executors

| Dialect | Pacakge                | Executor         | tx  |
| :------ | :--------------------- | :--------------- | :-- |
| MySQL   | `@msrass/query-mysql2` | `MySql2Executor` | yes |

## Contributing

_The library is still very early in development..._

The following features are prioritized:

- Addition of insert and delete functionality

### Testing

The `Deno` build in testrunner is used for testing.

From the repo root, unit tests can be run with `deno task test`, whereas
integration tests can be via `deno task test:integration`.

### Requirements

To build and test the project both `deno`, `docker` and `bash` are required. The
latter two only for performing integration tests.

All tests must parse and code must be formatted via the `deno fmt` command.
Aditionally no errors should result from running `deno check` or `deno lint`.
