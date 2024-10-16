import {
  IAnalyticsProfiler,
  PassthroughAnalyticsProfiler,
} from "@powerhouse/analytics-engine-core";
import {
  KnexAnalyticsStore,
  SqlQueryLogger,
  SqlResultsLogger,
} from "@powerhouse/analytics-engine-knex";
import fs from "fs";
import knexFactory from "knex";
import * as SQLite from "wa-sqlite";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs";
import { SQLiteQueryExecutor } from "./SQLiteExecutor";

// this is awful, but needed for wa-sqlite to load from file:/// because fetch
// cannot load file:/// paths
const unalteredFetch = fetch;
if (typeof window === "undefined") {
  (global as any).fetch = async function (...args: any) {
    const url = args[0];
    if (url.startsWith("file:///")) {
      // read file from disk
      const path = url.replace("file://", "");
      const res = fs.readFileSync(path);

      return new Response(res, {
        status: 200,
        headers: { "Content-Type": "application/wasm" },
      });
    }

    // call original fetch
    return await (unalteredFetch as Function)(...args);
  };
} else {
  (window as any).fetch = async function (...args: any) {
    let url = args[0];

    console.log("fetch", url);

    // is this a localhost path? (save the port)
    if (
      url.startsWith("http://localhost") &&
      url.includes("wa-sqlite-async.wasm")
    ) {
      const port = window.location.port;
      url = `http://localhost:${port}/node_modules/wa-sqlite/dist/wa-sqlite-async.wasm`;
      args[0] = url;
    }

    return await (unalteredFetch as Function)(...args);
  };
}

const initSql = `

  create table if not exists "AnalyticsSeries"
  (
    -- id is a serial in psql, but not in sqlite
    id     integer       primary key,
    source varchar(255) not null,
    start  timestamp    not null,
    "end"  timestamp,
    metric varchar(255) not null,
    value  real         not null,
    unit   varchar(255),
    fn     varchar(255) not null,
    params json
  );

  create unique index if not exists "AnalyticsSeries_pkey"
    on "AnalyticsSeries" (id);

  create index if not exists analyticsseries_end_index
      on "AnalyticsSeries" ("end");

  create index if not exists analyticsseries_fn_index
      on "AnalyticsSeries" (fn);

  create index if not exists analyticsseries_metric_index
      on "AnalyticsSeries" (metric);

  create index if not exists analyticsseries_source_index
      on "AnalyticsSeries" (source);

  create index if not exists analyticsseries_start_index
      on "AnalyticsSeries" (start);

  create index if not exists analyticsseries_unit_index
      on "AnalyticsSeries" (unit);

  create index if not exists analyticsseries_value_index
      on "AnalyticsSeries" (value);

  create table if not exists "AnalyticsDimension"
  (
    -- id is a serial in psql, but not in sqlite
    id          integer        primary key,
    dimension   varchar(255)  not null,
    path        varchar(255)  not null,
    label       varchar(255),
    icon        varchar(1000),
    description text
  );

  create unique index if not exists "AnalyticsDimension_pkey"
    on "AnalyticsDimension" (id);

  create index if not exists analyticsdimension_dimension_index
      on "AnalyticsDimension" (dimension);

  create index if not exists analyticsdimension_path_index
      on "AnalyticsDimension" (path);

  create table if not exists "AnalyticsSeries_AnalyticsDimension"
  (
    "seriesId"    integer not null
      constraint analyticsseries_analyticsdimension_seriesid_foreign
        references "AnalyticsSeries"
        on delete cascade,
    "dimensionId" integer not null
      constraint analyticsseries_analyticsdimension_dimensionid_foreign
        references "AnalyticsDimension"
        on delete cascade
  );

  create index if not exists analyticsseries_analyticsdimension_dimensionid_index
    on "AnalyticsSeries_AnalyticsDimension" ("dimensionId");

  create index if not exists analyticsseries_analyticsdimension_seriesid_index
      on "AnalyticsSeries_AnalyticsDimension" ("seriesId");

`;

export class MemoryAnalyticsStore extends KnexAnalyticsStore {
  private _sqliteExecutor: SQLiteQueryExecutor;
  private _profiler: IAnalyticsProfiler;
  private _sql: SQLiteAPI | null = null;
  private _db: number | null = null;

  public constructor(
    queryLogger?: SqlQueryLogger,
    resultsLogger?: SqlResultsLogger,
    profiler?: IAnalyticsProfiler
  ) {
    const knex = knexFactory({
      client: "sqlite3",
      useNullAsDefault: true,
    });

    if (!profiler) {
      profiler = new PassthroughAnalyticsProfiler();
    }

    const sqliteExecutor = new SQLiteQueryExecutor(
      profiler,
      queryLogger,
      resultsLogger
    );

    super(sqliteExecutor, knex);

    this._profiler = profiler;
    this._sqliteExecutor = sqliteExecutor;
  }

  public async init() {
    // sqlite3
    let module: any;
    try {
      module = await SQLiteESMFactory();
    } catch (error) {
      throw new Error("Failed to load SQLite module: " + error);
    }

    this._sql = SQLite.Factory(module);

    // create filesystems
    this.initFS(module, this._sql);

    // open db
    this._db = await this._sql.open_v2("analytics");

    // init executor
    this._sqliteExecutor.init(this._sql, this._db);

    // create tables if they do not exist
    await this._sql.exec(this._db!, initSql);
  }

  protected initFS(module: any, sql: SQLiteAPI) {
    // subclasses may implement
  }

  public async raw(sql: string) {
    const values: any[] = [];

    await this._profiler.record(
      "QueryRaw",
      async () =>
        await this._sql?.exec(this._db!, sql, (row, col) => {
          const value: any = {};
          for (let i = 0; i < col.length; i++) {
            value[col[i]] = row[i];
          }

          values.push(value);
        })
    );

    return values;
  }

  public async destroy() {
    super.destroy();

    await this._sql?.close(this._db);
  }
}
