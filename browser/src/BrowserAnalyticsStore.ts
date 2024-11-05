import { MemoryAnalyticsStore } from "./MemoryAnalyticsStore.js";
import {
  SqlQueryLogger,
  SqlResultsLogger,
} from "@powerhousedao/analytics-engine-knex";
import { IAnalyticsProfiler } from "@powerhousedao/analytics-engine-core";
import { IdbFs, PGlite } from "@electric-sql/pglite";

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

  override async instance(): Promise<PGlite> {
    return await PGlite.create({
      fs: new IdbFs(this._dbName),
      relaxedDurability: true,
    });
  }
}
