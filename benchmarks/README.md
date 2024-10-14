#### Benchmarks

The code in this directory measures performance characteristics of the in-memory analytics implementation.

##### Development Prereqs

```
pnpm link --global @powerhouse/analytics-engine-core
pnpm link --global @powerhouse/analytics-engine-knex
pnpm link --global @powerhouse/analytics-engine-browser
pnpm link --global @powerhouse/analytics-engine-pg
pnpm install
```

##### Dump

First, a SQL dump was created using the `dump-db.sh` script:

```
./dump-db.sh <user> <password> <host> <db>
```

This outputs a raw file in `data/dump.sql`. The small and dumps have been hand-edited to remove some create table statements, schema ("public."), and pared down to just the raw inserts. These are then loaded from disk for benchmarking.

> This dump also needs to be input into the postgres instance. No script is included to do this for you, as of yet.

### Execute

The tests may take awhile to run because of the HUGE dump.

```
# test memory
pnpm test-memory-wasm
pnpm test-memory-js
```

```
# test pg
docker compose -f ../pg/docker-compose.test.yml up -d
pnpm test-pg-js
```
