import fs from "fs";
import { DateTime } from "luxon";
import { MemoryAnalyticsStore } from "@powerhouse/analytics-engine-browser";
import { Bench } from "tinybench";
import { AnalyticsPath } from "@powerhouse/analytics-engine-core";
import { queryLogger, resultsLogger } from "./util.js";

// first, load the data
const sqlHuge = fs.readFileSync("./data/dump-huge.sql", "utf-8");

const store: MemoryAnalyticsStore = new MemoryAnalyticsStore(
  queryLogger("memory"),
  resultsLogger("memory")
);
await store.init();
await store.raw(sqlHuge);

const bench = new Bench();

/**
 * "start": "2023-01-01",
    "metrics": [
      "ProtocolNetOutflow", "PaymentsOnChain"
    ],
    "granularity": "monthly",
    "currency": "DAI",
    "dimensions": [
      {
        "name": "budget",
        "select": "atlas/scopes/SUP/INC/TCH-001",
        "lod": 5
      }
    ]
 */
bench.add("Select Distinct", async () => {
  await store.getMatchingSeries({
    start: DateTime.fromJSDate(new Date("2023-01-01")),
    end: null,
    currency: AnalyticsPath.fromString("DAI"),
    metrics: ["ProtocolNetOutflow", "PaymentsOnChain"],
    select: {
      budget: [AnalyticsPath.fromString("atlas/scopes/SUP/INC/TCH-001")],
    },
  });
});

await bench.warmup();
await bench.run();

console.table(bench.table());
