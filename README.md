## Overview

The Powerhouse `analytics-engine` contains a powerful, distributed, time-series analytics system, written in Typescript.

### Usage Quickstart

...

### Development Quickstart

The analytics engine is broken up into several modules. The module found in the `core/` directory is the primary interface for interacting with the engine, and also contains query and aggregation components. The `knex/`, `pg/`, and `browser/` directories contain modules for the backing storage engines.

For all modules, we use the `pnpm` package manager, `tsc-watch` as a filewatcher, and `vitest` for running tests.

All modules extend the [`tsconfig.json`](./tsconfig.json) found the root directory of the repo.

#### core/

Local development of the `core/` module is simple:

```
cd core/
pnpm install
```

To run a file watcher, use:

```
pnpm dev
```

This will start the `tsc-watch` utility:

```
12:36:03 PM - Starting compilation in watch mode...
12:36:04 PM - Found 0 errors. Watching for file changes.
```

Unit and a few integration tests are found in the `tests/` sub-directory. These can be run with:

```
pnpm test
```

#### knex/

The `knex/` directory provides an analytics storage implementation on top of [knex.js](https://knexjs.org/).

Similarly to the `core/` module, use `pnpm install` for setup, `pnpm dev` for a file watcher, and `pnpm test` to run tests.

##### pg/

The `pg/` directory provides an analytics storage implementation on top of the Postgres adapter, `pg`. This module is intended to be run in a server-side environment and relies on several packages typically provided by NodeJS.

```
cd pg/
pnpm install
```

Similiarly to other modules, `pnpm dev` starts a file watcher.

Since the `pg/` package needs a database, a we include a [`docker-compose.test.yml`](./pg/docker-compose.test.yml) Compose file. This allows for quick iteration without needing to install Postgres locally.

This can be used to start Postgres quickly for tests:

```
docker compose -f docker-compose.test.yml up -d

pnpm test

... iterate on tests

docker compose -f docker-compose.test.yml down
```

#### /browser

Finally, a store is provided for the browser in the `browser/` directory.

```
cd browser/
pnpm install
```

Similarly to other modules, `pnpm dev` starts a file watcher.

Testing the browser implementation, however, requires a bit of setup. These tests run in a browser using `playwright`. To setup, run:

```
pnpm exec playwright install
```

This may require answering a few questions, but installs necessary components to your system. Once this is done, you can now run tests with:

```
pnpm test
```

This will open a browser window and run your tests!

### Benchmarks

There are several benchmarking suites that test relative performance of the different stores. These are all in the `benchmarks/` directory. See the [benchmarking docs](./benchmarks/README.md) to get up and running.

### Compatibility

We also provide integration tests that compare responses from an analytics store with a Postgres store with responses from the browser store. These are found in the `compat/` directory. Before running, ensure you setup the postgres db.

```
cd compat/
docker compose -f ../pg/docker-compose.test.yml up -d
```

Next, follow the [benchmarking docs](./benchmarks/README.md) to to dump ~200k records into the local db.

Finally, you're ready to compare the in-memory and pg stores side by side for compatibility:

```
pnpm test
```
