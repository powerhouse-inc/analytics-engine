import fs from "fs";
import { DateTime } from "luxon";
import { Bench } from "tinybench";
import { AnalyticsPath } from "document-analytics-core";
import { logs, queryLogger, resultsLogger } from "./util.js";
import {
  KnexQueryExecutor,
  PostgresAnalyticsStore,
} from "document-analytics-pg";
import { MemoryAnalyticsStore } from "document-analytics-memory";

// todo: export these from document-analytics-pg
const passthroughProfiler = () => ({
  prefix: "",
  push: (system: string) => {},
  pop: () => {},
  record: async (metric: string, fn: () => Promise<any>) => await fn(),
});

const connectionString = process.env.PG_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("PG_CONNECTION_STRING not set");
}
const postgres = new PostgresAnalyticsStore(
  connectionString,
  new KnexQueryExecutor(
    passthroughProfiler(),
    queryLogger("pg"),
    resultsLogger("pg")
  )
);

console.log(`Postgres initialized and connecting to ${connectionString}.`);

const sqlHuge = fs.readFileSync("./data/dump-huge.sql", "utf-8");
const memory = new MemoryAnalyticsStore(
  queryLogger("memory"),
  resultsLogger("memory")
);
await memory.init();
await memory.raw(sqlHuge);

console.log("Memory initialized.");

const query = {
  start: DateTime.fromJSDate(new Date("2023-01-01")),
  end: null,
  currency: AnalyticsPath.fromString("DAI"),
  metrics: ["ProtocolNetOutflow", "PaymentsOnChain"],
  select: {
    budget: [AnalyticsPath.fromString("atlas/scopes/SUP/INC/TCH-001")],
  },
};

const bench = new Bench();

bench
  .add(
    "PG",
    async () => {
      await postgres.getMatchingSeries(query);
    },
    logs("PG")
  )
  .add(
    "Memory",
    async () => {
      await memory.getMatchingSeries(query);
    },
    logs("Memory")
  );

await bench.warmup();
await bench.run();

console.table(bench.table());

postgres.destroy();
memory.destroy();
