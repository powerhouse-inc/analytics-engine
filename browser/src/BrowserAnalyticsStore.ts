import { IDBBatchAtomicVFS } from "wa-sqlite/src/examples/IDBBatchAtomicVFS.js";
import { MemoryAnalyticsStore } from "./MemoryAnalyticsStore.js";
import {
  SqlQueryLogger,
  SqlResultsLogger,
} from "@powerhousedao/analytics-engine-knex";
import { IAnalyticsProfiler } from "@powerhousedao/analytics-engine-core";

export class BrowserAnalyticsStore extends MemoryAnalyticsStore {
  private _dbName: string;

  constructor(
    databaseName: string,
    queryLogger?: SqlQueryLogger,
    resultsLogger?: SqlResultsLogger,
    profiler?: IAnalyticsProfiler
  ) {
    super(queryLogger, resultsLogger, profiler);

    this._dbName = databaseName;
  }

  protected initFS(module: any, sql: SQLiteAPI) {
    const vfs = new IDBBatchAtomicVFS(this._dbName, module);
    sql.vfs_register(vfs, true);
  }
}
