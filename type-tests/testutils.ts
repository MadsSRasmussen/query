import { Store } from "@msrass/query";

import { MockCompiler, MockExecutor } from "./mocks.ts";
import type { DB } from "./db.types.ts";

export const mockStore = new Store<DB>().withExecutor(
    new MockCompiler(),
    new MockExecutor(),
);
