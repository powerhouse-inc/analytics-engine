## Overview

![License](https://img.shields.io/npm/l/%40powerhousedao%2Fanalytics-engine-core?color=blue) ![Build](https://github.com/powerhouse-inc/analytics-engine/actions/workflows/publish-all.yml/badge.svg)

The Powerhouse `analytics-engine` contains a powerful, distributed, time-series analytics system, written in Typescript.

### Usage Quickstart

...

### Development Quickstart

The analytics engine is broken up into several modules. The module found in the `core/` directory is the primary interface for interacting with the engine, and also contains query and aggregation components. The `knex/`, `pg/`, and `browser/` directories contain modules for the backing storage engines.

For all modules, we use the `pnpm` package manager, `tsc-watch` as a filewatcher, and `vitest` for running tests.

All modules extend the [`tsconfig.json`](./tsconfig.json) found the root directory of the repo.

#### core/

![Core Version](https://img.shields.io/npm/v/%40powerhousedao%2Fanalytics-engine-core?color=blue
)

Local development of the `core/` module is simple:

```bash
cd core/
pnpm install
```

To run a file watcher, use:

```bash
pnpm dev
```

This will start the `tsc-watch` utility:

```
12:36:03 PM - Starting compilation in watch mode...
12:36:04 PM - Found 0 errors. Watching for file changes.
```

Unit and a few integration tests are found in the `tests/` sub-directory. These can be run with:

```bash
pnpm test
```

#### knex/

![Knex Version](https://img.shields.io/npm/v/%40powerhousedao%2Fanalytics-engine-knex?color=blue
)

The `knex/` directory provides an analytics storage implementation on top of [knex.js](https://knexjs.org/).

Similarly to the `core/` module, use `pnpm install` for setup, `pnpm dev` for a file watcher, and `pnpm test` to run tests.

#### pg/

![PG Version](https://img.shields.io/npm/v/%40powerhousedao%2Fanalytics-engine-pg?color=blue
)

The `pg/` directory provides an analytics storage implementation on top of the Postgres adapter, [`pg`](https://www.npmjs.com/package/pg). This module is intended to be run in a server-side environment and relies on several packages typically provided by NodeJS.

```bash
cd pg/
pnpm install
```

Similiarly to other modules, `pnpm dev` starts a file watcher.

Since the `pg/` package needs a database, we include a [`docker-compose.test.yml`](./pg/docker-compose.test.yml) Compose file. This allows for quick iteration without needing to install Postgres locally.

This can be used to start Postgres quickly for tests:

```bash
docker compose -f docker-compose.test.yml up -d

pnpm test

docker compose -f docker-compose.test.yml down
```

Postgres allows for initialization scripts to be run, and we use this to create the necessary analytics tables, indices, and other objects. This script can be found in `pg/test/scripts`. However, sometimes it is handy to destroy this database, which can be tricky to find with Docker volumes. Instead of deleting the volume, you can simply delete the mounted folder that is configured:

```bash
docker compose -f docker-compose.test.yml down

rm -rf ./.db

docker compose -f docker-compose.test.yml up
```

You will be able to tell that the tables are recreated by looking at the logs. Here is an example of what you should see:

```
/usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/initdb.sh
database-1  | CREATE DATABASE
database-1  | You are now connected to database "analytics" as user "postgres".
database-1  | CREATE TABLE
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE TABLE
database-1  | CREATE INDEX
database-1  | CREATE INDEX
database-1  | CREATE TABLE
database-1  | CREATE INDEX
database-1  | CREATE INDEX
```

#### /browser

![Browser Version](https://img.shields.io/npm/v/%40powerhousedao%2Fanalytics-engine-browser?color=blue
)

Finally, a store is provided for the browser in the `browser/` directory.

```bash
cd browser/
pnpm install
```

Similarly to other modules, `pnpm dev` starts a file watcher.

Testing the browser implementation, however, requires a bit of setup. These tests run in a browser using `playwright`. To setup, run:

```bash
pnpm exec playwright install
```

This may require answering a few questions, but installs necessary components to your system. Once this is done, you can now run tests with:

```bash
pnpm test
```

This will open a browser window and run your tests!

### Benchmarks

There are several benchmarking suites that test relative performance of the different stores using [tinybench](https://github.com/tinylibs/tinybench). These are all in the `benchmarks/` directory. See the [benchmarking docs](./benchmarks/README.md) to get up and running.

### Compatibility

We also provide integration tests that compare responses from an analytics store with a Postgres store with responses from the browser store. These are found in the `compat/` directory. Before running, ensure you setup the postgres db.

```bash
cd compat/
docker compose -f ../pg/docker-compose.test.yml up -d
```

Next, follow the [benchmarking docs](./benchmarks/README.md) to to dump ~200k records into the local db.

Finally, you're ready to compare the in-memory and pg stores side by side for compatibility:

```bash
pnpm test
```

### Docs

Our API usage docs are found in the `/docs` folder. We use [slatedocs](https://github.com/slatedocs/slate). To build and serve these locally, with a watcher:

```bash
cd docs-src
docker run --rm --name slate -p 4567:4567 -v $(pwd)/source:/srv/slate/source slatedocs/slate serve
```

Then navigate to [`http://localhost:4567`](http://localhost:4567).
