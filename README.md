### Overview

#### Development Quickstart

##### Core development:

```
cd core
pnpm install
pnpm link --global
pnpm dev
```

##### Knex implementation:

```
cd knex
pnpm link --global
pnpm dev
```

##### Postgres implementation:

```
cd pg
pnpm link --global
pnpm link --global document-analytics-core
pnpm link --global document-analytics-knex
pnpm install
pnpm dev
```

##### Memory implementation:

```
cd memory
pnpm link --global
pnpm link --global document-analytics-core
pnpm link --global document-analytics-knex
pnpm install
pnpm dev
```

#### Testing

Tests are separated into `/test` directories in the respective module.

##### Core:

```
cd core
pnpm test
```

##### Postgres implementation:

The Postgres implementation requires a correctly configured, running Postgres instance. While we could move the entire test suite inside of a test container, this is a bit of a hassle for quick iteration. Instead, we can simply run postgres in a container and run the tests locally, with a local file watcher.

```
cd pg/
docker compose -f docker-compose.test.yml up -d
pnpm test

... iterate on tests ...

docker compose -f docker-compose.test.yml down
```

Sometimes, it's useful to see the data the integration tests insert into the database. In this case, run with `CLEAN_UP_DB=false`:

```
CLEAN_UP_DB=false pnpm test
```

This will leave data in the DB.

##### Memory implementation

The in-memory implementation tests run in a browser using vitest and playwright. To get setup, run:

```
pnpm exec playwright install
pnpm test
```

This will open a browser window and run your tests!

##### Benchmarks

There are several benchmarking suites that test relative performance of the different stores. These are all in the `benchmarks/` directory. See the [benchmarking docs](./benchmarks/README.md) to get up and running.

##### Compatibility

There are integration tests that compare responses from an analytics store with a Postgres store with responses from the in-memory store. These are found in the `compat/` directory. Before running, ensure you setup the postgres db.

```
cd compat/
docker compose -f ../pg/docker-compose.test.yml up -d
```

Next, follow the [benchmarking docs](./benchmarks/README.md) to to dump ~200k records into the local db.

Finally, you're ready to compare the in-memory and pg stores side by side for compatibility:

```
pnpm test
```
