import knexFactory, { Knex } from "knex";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs";
import { IDBBatchAtomicVFS } from "wa-sqlite/src/examples/IDBBatchAtomicVFS.js";
import * as SQLite from "wa-sqlite";
import fs from "fs";
import {
  KnexAnalyticsStore,
  IKnexQueryExecutor,
} from "document-analytics-knex";

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

class SQLiteQueryExecutor implements IKnexQueryExecutor {
  private _index: number = 0;
  private _sql: SQLiteAPI | null = null;
  private _db: number | null = null;

  constructor(
    private readonly _queryLogger?: (index: number, query: string) => void,
    private readonly _resultsLogger?: (index: number, results: any) => void
  ) {}

  init(sql: SQLiteAPI, db: number) {
    this._sql = sql;
    this._db = db;
  }

  async execute<T extends {}, U>(query: Knex.QueryBuilder<T, U>) {
    if (!this._sql || !this._db) {
      throw new Error("SQLiteQueryExecutor not initialized");
    }

    const results: any = [];
    const raw = query.toString();
    const index = this._index++;

    if (this._queryLogger) {
      this._queryLogger(index, raw);
    }

    await this._sql!.exec(this._db!, raw, (row, col) => {
      const value: any = {};

      for (let i = 0; i < col.length; i++) {
        // todo: "reviver"
        const prop = col[i];
        let val: any = row[i];
        if (prop === "start" || prop === "end") {
          val = val ? new Date(val) : null;
        } else if (prop === "params") {
          val = JSON.parse(val);
        }

        value[prop] = val;
      }

      results.push(value);
    });

    if (this._resultsLogger) {
      this._resultsLogger(index, results);
    }

    return results;
  }
}

export enum MemoryStoreType {
  Memory,
  IDB,
}

export type MemoryStoreOptions = {
  type: MemoryStoreType;
  idbName: string;
};

export class MemoryAnalyticsStore extends KnexAnalyticsStore {
  private _sqliteExecutor: SQLiteQueryExecutor;
  private _sql: SQLiteAPI | null = null;
  private _db: number | null = null;

  public constructor(
    queryLogger?: (index: number, query: string) => void,
    resultsLogger?: (index: number, results: any) => void
  ) {
    const knex = knexFactory({
      client: "sqlite3",
      useNullAsDefault: true,
    });

    const sqliteExecutor = new SQLiteQueryExecutor(queryLogger, resultsLogger);

    super(sqliteExecutor, knex);

    this._sqliteExecutor = sqliteExecutor;
  }

  public async init(options?: MemoryStoreOptions) {
    // sqlite3
    let module: any;
    try {
      module = await SQLiteESMFactory();
    } catch (error) {
      throw new Error("Failed to load SQLite module: " + error);
    }

    this._sql = SQLite.Factory(module);

    // create the file system
    if (options?.type === MemoryStoreType.IDB) {
      const vfs = new IDBBatchAtomicVFS(options.idbName, module);
      this._sql.vfs_register(vfs, true);
    }

    // open db
    this._db = await this._sql.open_v2("analytics");

    // init executor
    this._sqliteExecutor.init(this._sql, this._db);

    // create tables if they do not exist
    await this._sql.exec(this._db!, initSql);
  }

  public async raw(sql: string) {
    const values: any[] = [];
    await this._sql?.exec(this._db!, sql, (row, col) => {
      const value: any = {};
      for (let i = 0; i < col.length; i++) {
        value[col[i]] = row[i];
      }

      values.push(value);
    });

    return values;
  }

  public async destroy() {
    super.destroy();

    await this._sql?.close(this._db);
  }
}
